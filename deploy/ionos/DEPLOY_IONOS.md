# DEPLOY IONOS VPS (HTTPS + `git pull`)

Ниже упрощенная рабочая схема без SSH-ключей, без `bare`-репозитория и без `post-receive` hook.

Модель деплоя:
1. Локально: `git push` в `origin` по HTTPS.
2. На VPS: `git pull` из `origin` и перезапуск сервисов.

---

## 0) Что используется в этой схеме
- Репозиторий: `https://github.com/<USER>/<REPO>.git` (или GitLab/Bitbucket по HTTPS)
- Рабочая папка на VPS: `/opt/ristoranti-site`
- Единый env: `/etc/ristoranti/ristoranti.env`
- Сервисы:
  - `ristoranti-site.service`
  - `ristoranti-bot-webhook.service`
- Nginx vhost: `/etc/nginx/sites-available/ristoranti-bot.conf`

---

## 1) Локально (Windows PowerShell): создать Git и привязать `origin` по HTTPS

```powershell
cd "C:\Users\be4ho\Desktop\YOSUPPORT\SITE RISTO"
git init
git branch -M main
```

Настрой identity только для этого проекта:
```powershell
git config user.name "Ristoranti Deploy"
git config user.email "ristoranti-deploy@local"
```

Первый коммит:
```powershell
git add .
git commit -m "Initial commit"
```

Привязка `origin` по HTTPS:
```powershell
git remote -v
```

Если `origin` уже есть и неверный:
```powershell
git remote set-url origin https://github.com/<USER>/<REPO>.git
```

Если `origin` еще нет:
```powershell
git remote add origin https://github.com/<USER>/<REPO>.git
```

Проверка:
```powershell
git remote -v
```

Первый push:
```powershell
git push -u origin main
```

Для private-репозитория при запросе пароля используй `PAT` (Personal Access Token), а не пароль аккаунта.

---

## 2) VPS (под `root`): одноразовый bootstrap

### 2.1 Установка зависимостей
```bash
apt update
apt install -y git nginx certbot python3-certbot-nginx curl ca-certificates gnupg

# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Проверка:
```bash
node -v
npm -v
nginx -v
git --version
```

### 2.2 Пользователь и каталоги проекта
```bash
adduser --disabled-password --gecos "" ristoranti
mkdir -p /opt/ristoranti-site
mkdir -p /etc/ristoranti
mkdir -p /var/www/certbot
chown -R ristoranti:ristoranti /opt/ristoranti-site /etc/ristoranti
chown -R www-data:www-data /var/www/certbot
```

### 2.3 Клонирование проекта на VPS по HTTPS

Публичный репозиторий:
```bash
sudo -u ristoranti git clone https://github.com/Skanexis/ristoranti.git /opt/ristoranti-site
```

Private-репозиторий (рекомендуется сохранить токен один раз):
```bash
sudo -u ristoranti git config --global credential.helper store
sudo -u ristoranti git clone https://github.com/<USER>/<REPO>.git /opt/ristoranti-site
```

При `clone` введи:
- Username: `<GITHUB_USERNAME>`
- Password: `<PAT>`

Проверка `origin` на VPS:
```bash
sudo -u ristoranti git -C /opt/ristoranti-site remote -v
```

---

## 3) VPS: `.env`, systemd, nginx, SSL

### 3.1 Единый env
```bash
cp /opt/ristoranti-site/.env.example /etc/ristoranti/ristoranti.env
chown ristoranti:ristoranti /etc/ristoranti/ristoranti.env
chmod 600 /etc/ristoranti/ristoranti.env
nano /etc/ristoranti/ristoranti.env
```

Обязательно заполни:
- `RI_ADMIN_LOGIN`
- `RI_ADMIN_PASSWORD_SALT`
- `RI_ADMIN_PASSWORD_HASH`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `WEBAPP_URL=https://bot.example.com/`
- `TELEGRAM_BOT_MODE=webhook`
- `TELEGRAM_WEBHOOK_BASE_URL=https://bot.example.com`
- `TELEGRAM_WEBHOOK_PATH=/telegram/webhook`
- `TELEGRAM_WEBHOOK_SECRET=<случайная hex строка>`
- `TELEGRAM_WEBHOOK_BIND_HOST=127.0.0.1`
- `TELEGRAM_WEBHOOK_PORT=3099`

Генерация hash и secret:
```bash
cd /opt/ristoranti-site
node scripts/generate-admin-hash.js "admin160uspectrum" admin
openssl rand -hex 32
```

### 3.2 Установка systemd сервисов
```bash
cp /opt/ristoranti-site/deploy/ionos/systemd/ristoranti-site.service /etc/systemd/system/
cp /opt/ristoranti-site/deploy/ionos/systemd/ristoranti-bot-webhook.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now ristoranti-site.service
systemctl enable --now ristoranti-bot-webhook.service
```

### 3.3 Nginx vhost
```bash
cp /opt/ristoranti-site/deploy/ionos/nginx/ristoranti-bot.example.conf /etc/nginx/sites-available/ristoranti-bot.conf
nano /etc/nginx/sites-available/ristoranti-bot.conf
```

Замени:
- `server_name bot.example.com;`
- SSL пути сертификатов

Включи конфиг:
```bash
ln -s /etc/nginx/sites-available/ristoranti-bot.conf /etc/nginx/sites-enabled/ristoranti-bot.conf
nginx -t
systemctl reload nginx
```

### 3.4 Выпуск SSL
```bash
certbot certonly --webroot -w /var/www/certbot -d ristoranti.yosupport.it
nginx -t
systemctl reload nginx
```

---

## 4) Telegram BotFather
- Выполни `/setdomain`
- Укажи домен: `bot.example.com`

Проверка webhook:
```bash
curl -s "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

## 5) Ежедневный деплой (через HTTPS + `git pull` на VPS)

### 5.1 Локально: отправить изменения
```powershell
cd "C:\Users\be4ho\Desktop\YOSUPPORT\SITE RISTO"
git add .
git commit -m "update"
git push origin main
```

### 5.2 На VPS: подтянуть и перезапустить сервисы
```bash
sudo -u ristoranti git -C /opt/ristoranti-site pull --ff-only origin main
systemctl restart ristoranti-site.service
systemctl restart ristoranti-bot-webhook.service
```

---

## 6) Проверка после деплоя

```bash
curl -I https://bot.example.com/
curl -s https://bot.example.com/api/health
curl -s http://127.0.0.1:3099/health
systemctl status ristoranti-site.service --no-pager
systemctl status ristoranti-bot-webhook.service --no-pager
```

---

## 7) Быстрый rollback

```bash
sudo -u ristoranti git -C /opt/ristoranti-site log --oneline -n 15
sudo -u ristoranti git -C /opt/ristoranti-site checkout <COMMIT_SHA>
systemctl restart ristoranti-site.service ristoranti-bot-webhook.service
```

Вернуться на `main`:
```bash
sudo -u ristoranti git -C /opt/ristoranti-site checkout main
sudo -u ristoranti git -C /opt/ristoranti-site pull --ff-only origin main
```

---

## 8) Частые проблемы

### 8.1 `remote origin already exists`
Исправление:
```powershell
git remote set-url origin https://github.com/<USER>/<REPO>.git
```

### 8.2 `fatal: Authentication failed` (HTTPS)
Причина: использован пароль вместо `PAT` или токен без нужных прав.  
Решение: создай/обнови `PAT` и повтори `git push` / `git pull`.

### 8.3 `fatal: Not possible to fast-forward, aborting`
На VPS есть локальные изменения.  
Проверь:
```bash
sudo -u ristoranti git -C /opt/ristoranti-site status
```
Убери локальные правки или закоммить их, затем снова:
```bash
sudo -u ristoranti git -C /opt/ristoranti-site pull --ff-only origin main
```
