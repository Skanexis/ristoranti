# DEPLOY IONOS VPS (Windows + Git + Nginx + Webhook)

Ниже одна рабочая инструкция "под ключ".  
Она **не мешает другим проектам**: отдельный пользователь, отдельный SSH-ключ, отдельный Git remote, отдельные systemd сервисы, отдельный nginx vhost.

## 0) Что будет изолировано
- Linux user: `ristoranti`
- Bare repo: `/srv/git/ristoranti-site.git`
- Рабочая папка: `/opt/ristoranti-site`
- Единый env: `/etc/ristoranti/ristoranti.env`
- Сервисы:
  - `ristoranti-site.service`
  - `ristoranti-bot-webhook.service`
- Nginx vhost: `/etc/nginx/sites-available/ristoranti-bot.conf`

---

## 1) Локально (Windows PowerShell) - подготовка Git + SSH

### 1.1 Открыть проект и инициализировать Git (если еще не инициализирован)
```powershell
cd "C:\Users\be4ho\Desktop\YOSUPPORT\SITE RISTO"
git init
git branch -M main
```

### 1.2 Задать Git identity ТОЛЬКО для этого проекта
```powershell
git config user.name "Ristoranti Deploy"
git config user.email "ristoranti-deploy@local"
```

Не используем `--global`, чтобы не смешивать с другими репами.

### 1.3 Создать отдельный SSH-ключ проекта (исправляет ошибку с `~/.ssh`)
```powershell
$sshDir = Join-Path $env:USERPROFILE ".ssh"
New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
ssh-keygen -t ed25519 -f "$sshDir\id_ed25519_ristoranti_ionos" -C "ristoranti-ionos"
```

Проверка:
```powershell
Get-ChildItem "$sshDir\id_ed25519_ristoranti_ionos*"
```

### 1.4 Добавить отдельный SSH host alias
Файл: `C:\Users\be4ho\.ssh\config`

```sshconfig
Host ionos-ristoranti
  HostName YOUR_VPS_IP_OR_DOMAIN
  User ristoranti
  IdentityFile C:\Users\be4ho\.ssh\id_ed25519_ristoranti_ionos
  IdentitiesOnly yes
  UserKnownHostsFile C:\Users\be4ho\.ssh\known_hosts_ristoranti
```

---

## 2) VPS (под root) - одноразовый bootstrap

### 2.1 Установить зависимости
```bash
apt update
apt install -y git nginx certbot python3-certbot-nginx curl ca-certificates gnupg

# Node.js LTS (без отдельного пакета npm, он уже внутри nodejs)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Проверка:
```bash
node -v
npm -v
nginx -v
```

### 2.2 Создать пользователя проекта
```bash
adduser --disabled-password --gecos "" ristoranti
```

### 2.3 Добавить публичный ключ
На локальном Windows выведи ключ:
```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_ristoranti_ionos.pub"
```

Скопируй вывод, потом на VPS:
```bash
mkdir -p /home/ristoranti/.ssh
chmod 700 /home/ristoranti/.ssh
nano /home/ristoranti/.ssh/authorized_keys
```
Вставь ключ, сохрани, затем:
```bash
chmod 600 /home/ristoranti/.ssh/authorized_keys
chown -R ristoranti:ristoranti /home/ristoranti/.ssh
```

### 2.4 Создать каталоги
```bash
mkdir -p /srv/git/ristoranti-site.git
mkdir -p /opt/ristoranti-site
mkdir -p /etc/ristoranti
mkdir -p /var/www/certbot
chown -R ristoranti:ristoranti /srv/git/ristoranti-site.git /opt/ristoranti-site /etc/ristoranti
chown -R www-data:www-data /var/www/certbot
```

### 2.5 Инициализировать bare repo
```bash
sudo -u ristoranti git init --bare /srv/git/ristoranti-site.git
```

---

## 3) VPS (под root) - автодеплой по `git push`

### 3.1 Дать ограниченный sudo только на restart двух сервисов
Выполняй строго по шагам (на VPS под `root`):

1. Создай файл с правилами:
```bash
cat > /etc/sudoers.d/ristoranti-deploy <<'EOF'
ristoranti ALL=(root) NOPASSWD: /bin/systemctl restart ristoranti-site.service
ristoranti ALL=(root) NOPASSWD: /bin/systemctl restart ristoranti-bot-webhook.service
EOF
```

2. Поставь правильные права (обязательно):
```bash
chown root:root /etc/sudoers.d/ristoranti-deploy
chmod 440 /etc/sudoers.d/ristoranti-deploy
```

3. Проверь синтаксис файла:
```bash
visudo -cf /etc/sudoers.d/ristoranti-deploy
```
Ожидаемый результат:
```text
/etc/sudoers.d/ristoranti-deploy: parsed OK
```

4. Проверь, что пользователь реально видит разрешения:
```bash
sudo -u ristoranti sudo -l
```
В выводе должны быть строки с:
- `/bin/systemctl restart ristoranti-site.service`
- `/bin/systemctl restart ristoranti-bot-webhook.service`

5. Проверка выполнения разрешенной команды:
```bash
sudo -u ristoranti sudo -n /bin/systemctl restart ristoranti-site.service
```
Если увидишь `Unit ... not found`, это нормально до установки сервиса.  
Важно, чтобы **не** было ошибки `a password is required` или `is not allowed to run sudo`.

Если на шаге 3 ошибка, сразу удаляй файл и создай заново:
```bash
rm -f /etc/sudoers.d/ristoranti-deploy
```

### 3.2 Создать hook `post-receive`
Выполняй строго по шагам (на VPS под `root`):

1. Создай файл hook одной командой:
```bash
cat > /srv/git/ristoranti-site.git/hooks/post-receive <<'EOF'
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

  restart_if_exists "ristoranti-site.service"
  restart_if_exists "ristoranti-bot-webhook.service"
done
EOF
```

2. Поставь владельца и права:
```bash
chown ristoranti:ristoranti /srv/git/ristoranti-site.git/hooks/post-receive
chmod 755 /srv/git/ristoranti-site.git/hooks/post-receive
```

3. Проверь, что файл на месте и исполняемый:
```bash
ls -l /srv/git/ristoranti-site.git/hooks/post-receive
```
В начале строки должно быть примерно: `-rwxr-xr-x`.

4. Проверь синтаксис скрипта:
```bash
sudo -u ristoranti bash -n /srv/git/ristoranti-site.git/hooks/post-receive
echo $?
```
Ожидаемо: `0`.

5. Тест, что hook вызывается от push:
- На локальном ПК сделай тестовый push:
```powershell
cd "C:\Users\be4ho\Desktop\YOSUPPORT\SITE RISTO"
git commit --allow-empty -m "hook test"
git push ionos main
```
- На VPS проверь, что код попал в рабочую папку:
```bash
ls -la /opt/ristoranti-site
```
Если push прошел без ошибок, hook работает.

---

## 4) Локально (Windows) - подключить remote и отправить код

```powershell
cd "C:\Users\be4ho\Desktop\YOSUPPORT\SITE RISTO"
git add .
git commit -m "Initial deploy"
git remote add ionos "ionos-ristoranti:/srv/git/ristoranti-site.git"
git push -u ionos main
```

Проверка SSH:
```powershell
ssh ionos-ristoranti "whoami"
```
Должно вернуть: `ristoranti`.

---

## 5) VPS - env, systemd, nginx, SSL

### 5.1 Единый env
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

Сгенерировать hash и secret:
```bash
cd /opt/ristoranti-site
node scripts/generate-admin-hash.js "SuperStrongPasswordHere" admin
openssl rand -hex 32
```

### 5.2 Установить systemd сервисы проекта
```bash
cp /opt/ristoranti-site/deploy/ionos/systemd/ristoranti-site.service /etc/systemd/system/
cp /opt/ristoranti-site/deploy/ionos/systemd/ristoranti-bot-webhook.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now ristoranti-site.service
systemctl enable --now ristoranti-bot-webhook.service
```

### 5.3 Подключить отдельный nginx vhost
```bash
cp /opt/ristoranti-site/deploy/ionos/nginx/ristoranti-bot.example.conf /etc/nginx/sites-available/ristoranti-bot.conf
nano /etc/nginx/sites-available/ristoranti-bot.conf
```

Замени:
- `server_name bot.example.com;`
- SSL пути сертификатов

Включи:
```bash
ln -s /etc/nginx/sites-available/ristoranti-bot.conf /etc/nginx/sites-enabled/ristoranti-bot.conf
nginx -t
systemctl reload nginx
```

### 5.4 Выпустить SSL (без правок других vhost)
```bash
certbot certonly --webroot -w /var/www/certbot -d bot.example.com
nginx -t
systemctl reload nginx
```

---

## 6) Telegram BotFather

- Выполни `/setdomain`
- Укажи домен: `bot.example.com`

Проверка webhook:
```bash
curl -s "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```
Ожидаемо: `url = https://bot.example.com/telegram/webhook`

---

## 7) Ежедневный деплой (только 3 команды)

Локально на Windows:
```powershell
cd "C:\Users\be4ho\Desktop\YOSUPPORT\SITE RISTO"
git add .
git commit -m "update"
git push ionos main
```

`post-receive` сам обновит `/opt/ristoranti-site` и перезапустит только сервисы этого проекта.

---

## 8) Проверка после деплоя

На VPS:
```bash
curl -I https://bot.example.com/
curl -s https://bot.example.com/api/health
curl -s http://127.0.0.1:3099/health
systemctl status ristoranti-site.service --no-pager
systemctl status ristoranti-bot-webhook.service --no-pager
```

---

## 9) Быстрый rollback

```bash
sudo -u ristoranti git --git-dir=/srv/git/ristoranti-site.git log --oneline -n 15
sudo -u ristoranti git --git-dir=/srv/git/ristoranti-site.git --work-tree=/opt/ristoranti-site checkout -f <COMMIT_SHA>
systemctl restart ristoranti-site.service ristoranti-bot-webhook.service
```

---

## 10) Частые проблемы

### 10.1 `Saving key "~/.ssh/..." failed`
Причина: нет папки `~/.ssh` в Windows.  
Решение: использовать шаг `1.3` (создание папки через `$env:USERPROFILE`).

### 10.2 `Permission denied (publickey)`
Проверь:
- правильный `IdentityFile` в `C:\Users\be4ho\.ssh\config`
- ключ вставлен в `/home/ristoranti/.ssh/authorized_keys`
- права `700` на `.ssh` и `600` на `authorized_keys`

### 10.3 Бот не получает апдейты
```bash
journalctl -u ristoranti-bot-webhook.service -n 200 --no-pager
curl -s "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

### 10.4 `nodejs : Conflicts: npm` / unmet dependencies
Не ставь пакет `npm` отдельно.  
Используй чистую переустановку Node.js:

```bash
apt-mark unhold nodejs npm || true
apt --fix-broken install -y
dpkg --configure -a
apt purge -y nodejs npm
apt autoremove -y
apt update
apt install -y curl ca-certificates gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```
