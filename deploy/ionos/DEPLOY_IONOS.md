# Единый Runbook: Setup + Git + Deploy (IONOS VPS)

Этот файл — **single source of truth** для проекта `Ristoranti d'Italia`.
Цель: полностью изолировать этот проект от других сервисов на вашем VPS.

## 0) Что именно изолируем
- отдельный Linux user: `ristoranti`
- отдельный bare Git repo: `/srv/git/ristoranti-site.git`
- отдельная рабочая директория: `/opt/ristoranti-site`
- единый env-файл: `/etc/ristoranti/ristoranti.env`
- отдельные systemd сервисы:
  - `ristoranti-site.service`
  - `ristoranti-bot-webhook.service`
- отдельный nginx vhost: `ristoranti-bot.conf`
- отдельный SSH key + `Host` alias только для этого проекта

Так ничего не смешивается с вашими другими Git/deploy потоками.

---

## 1) Локальная подготовка Git (только для этого проекта)

### 1.1 Инициализация репозитория (если еще нет `.git`)
```bash
cd /path/to/SITE\ RISTO
git init
git branch -M main
```

### 1.2 Локальная (не global) Git identity для этого проекта
```bash
git config user.name "Ristoranti Deploy"
git config user.email "ristoranti-deploy@local"
```

Важно: не используем `--global`, чтобы не ломать другие репозитории.

### 1.3 Первый коммит
```bash
git add .
git commit -m "Initial structured project"
```

---

## 2) Отдельный SSH-ключ под этот проект

### 2.1 На локальной машине
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_ristoranti_ionos -C "ristoranti-ionos"
```

### 2.2 Локальный `~/.ssh/config` (отдельный alias)
```sshconfig
Host ionos-ristoranti
  HostName YOUR_VPS_IP_OR_DOMAIN
  User ristoranti
  IdentityFile ~/.ssh/id_ed25519_ristoranti_ionos
  IdentitiesOnly yes
  UserKnownHostsFile ~/.ssh/known_hosts_ristoranti
```

Плюс: отдельный `known_hosts` и отдельный ключ — без путаницы с другими VPS.

---

## 3) VPS bootstrap (один раз)

Дальше команды на VPS под `root`.

### 3.1 Создать отдельного пользователя проекта
```bash
adduser --disabled-password --gecos "" ristoranti
```

### 3.2 Добавить публичный ключ локальной машины
```bash
mkdir -p /home/ristoranti/.ssh
chmod 700 /home/ristoranti/.ssh
cat >> /home/ristoranti/.ssh/authorized_keys
# вставьте сюда содержимое ~/.ssh/id_ed25519_ristoranti_ionos.pub
chmod 600 /home/ristoranti/.ssh/authorized_keys
chown -R ristoranti:ristoranti /home/ristoranti/.ssh
```

### 3.3 Директории проекта
```bash
mkdir -p /srv/git/ristoranti-site.git
mkdir -p /opt/ristoranti-site
mkdir -p /etc/ristoranti
mkdir -p /var/www/certbot
chown -R ristoranti:ristoranti /srv/git/ristoranti-site.git /opt/ristoranti-site /etc/ristoranti
chown -R www-data:www-data /var/www/certbot
```

### 3.4 Инициализировать bare repo
```bash
sudo -u ristoranti git init --bare /srv/git/ristoranti-site.git
```

---

## 4) Автодеплой через Git push (main -> /opt/ristoranti-site)

### 4.1 Разрешить ограниченный `sudo` для рестарта только этих сервисов
Создайте файл:
`/etc/sudoers.d/ristoranti-deploy`

Содержимое:
```text
ristoranti ALL=(root) NOPASSWD: /bin/systemctl restart ristoranti-site.service
ristoranti ALL=(root) NOPASSWD: /bin/systemctl restart ristoranti-bot-webhook.service
```

Проверка:
```bash
visudo -cf /etc/sudoers.d/ristoranti-deploy
```

### 4.2 `post-receive` hook в bare repo
Файл:
`/srv/git/ristoranti-site.git/hooks/post-receive`

```bash
#!/usr/bin/env bash
set -euo pipefail

GIT_DIR="/srv/git/ristoranti-site.git"
APP_DIR="/opt/ristoranti-site"

restart_if_exists() {
  local unit="$1"
  if /bin/systemctl list-unit-files --type=service --no-legend | /usr/bin/awk '{print $1}' | /bin/grep -qx "$unit"; then
    sudo /bin/systemctl restart "$unit"
  fi
}

while read -r oldrev newrev refname; do
  if [[ "$refname" != "refs/heads/main" ]]; then
    continue
  fi

  mkdir -p "$APP_DIR"
  git --git-dir="$GIT_DIR" --work-tree="$APP_DIR" checkout -f main

  # Если сервисы уже установлены — рестартуем только их.
  restart_if_exists "ristoranti-site.service"
  restart_if_exists "ristoranti-bot-webhook.service"
done
```

```bash
chmod +x /srv/git/ristoranti-site.git/hooks/post-receive
chown ristoranti:ristoranti /srv/git/ristoranti-site.git/hooks/post-receive
```

---

## 5) Подключить remote на локальной машине
```bash
cd /path/to/SITE\ RISTO
git remote add ionos ionos-ristoranti:/srv/git/ristoranti-site.git
git remote -v
```

Первый деплой:
```bash
git push -u ionos main
```

---

## 6) Настройка единого env на VPS

```bash
cp /opt/ristoranti-site/.env.example /etc/ristoranti/ristoranti.env
chown ristoranti:ristoranti /etc/ristoranti/ristoranti.env
chmod 600 /etc/ristoranti/ristoranti.env
```

Сгенерировать hash и секрет:
```bash
cd /opt/ristoranti-site
node scripts/generate-admin-hash.js "SuperStrongPasswordHere" admin
openssl rand -hex 32
```

Заполнить в одном файле `/etc/ristoranti/ristoranti.env`:
- `RI_ADMIN_LOGIN`
- `RI_ADMIN_PASSWORD_SALT`
- `RI_ADMIN_PASSWORD_HASH`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `WEBAPP_URL=https://bot.example.com/`
- `TELEGRAM_BOT_MODE=webhook`
- `TELEGRAM_WEBHOOK_BASE_URL=https://bot.example.com`
- `TELEGRAM_WEBHOOK_PATH=/telegram/webhook`
- `TELEGRAM_WEBHOOK_SECRET=<hex>`
- `TELEGRAM_WEBHOOK_BIND_HOST=127.0.0.1`
- `TELEGRAM_WEBHOOK_PORT=3099`

---

## 7) Systemd сервисы
```bash
cp /opt/ristoranti-site/deploy/ionos/systemd/ristoranti-site.service /etc/systemd/system/
cp /opt/ristoranti-site/deploy/ionos/systemd/ristoranti-bot-webhook.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now ristoranti-site.service
systemctl enable --now ristoranti-bot-webhook.service
```

Проверка:
```bash
systemctl status ristoranti-site.service
systemctl status ristoranti-bot-webhook.service
journalctl -u ristoranti-site.service -f
journalctl -u ristoranti-bot-webhook.service -f
```

---

## 8) Nginx поддомен (изолированный vhost)
```bash
cp /opt/ristoranti-site/deploy/ionos/nginx/ristoranti-bot.example.conf /etc/nginx/sites-available/ristoranti-bot.conf
```

В файле замените:
- `server_name bot.example.com;`
- пути SSL сертификата под ваш домен

Включить:
```bash
ln -s /etc/nginx/sites-available/ristoranti-bot.conf /etc/nginx/sites-enabled/ristoranti-bot.conf
nginx -t
systemctl reload nginx
```

---

## 9) SSL без вмешательства в другие vhost
```bash
certbot certonly --webroot -w /var/www/certbot -d bot.example.com
nginx -t
systemctl reload nginx
```

---

## 10) Telegram (BotFather)
- `/setdomain` -> `bot.example.com`

Проверка webhook:
```bash
curl -s https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo
```

Должно быть:
- `url = https://bot.example.com/telegram/webhook`
- без постоянных ошибок

---

## 11) Повседневный деплой (одна команда)

Локально:
```bash
git add .
git commit -m "your change"
git push ionos main
```

`post-receive` сам выкатит изменения и перезапустит только сервисы этого проекта.

---

## 12) Безопасный rollback

На VPS:
```bash
sudo -u ristoranti git --git-dir=/srv/git/ristoranti-site.git log --oneline --decorate -n 10
sudo -u ristoranti git --git-dir=/srv/git/ristoranti-site.git --work-tree=/opt/ristoranti-site checkout -f <COMMIT_SHA>
systemctl restart ristoranti-site.service ristoranti-bot-webhook.service
```

---

## 13) Диагностика

Проверки:
```bash
curl -I https://bot.example.com/
curl -s https://bot.example.com/api/health
curl -s http://127.0.0.1:3099/health
```

Если push не деплоит:
```bash
tail -n 200 /srv/git/ristoranti-site.git/hooks/post-receive
sudo -u ristoranti ls -la /srv/git/ristoranti-site.git/hooks/
```

Если бот не получает апдейты:
```bash
journalctl -u ristoranti-bot-webhook.service -n 200 --no-pager
curl -s https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo
```
