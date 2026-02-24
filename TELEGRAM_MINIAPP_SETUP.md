# Telegram Mini App + Cloudflare (Quick Start)

## 1) Подготовка
1. Скопируйте `.env.example` в `.env`.
2. Заполните:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_USERNAME`
3. Если нужен локальный запуск без туннеля, заранее задайте `WEBAPP_URL`.

## 2) Важный шаг в BotFather
Telegram Mini App требует домен:
1. Откройте `@BotFather`
2. Команда: `/setdomain`
3. Выберите вашего бота
4. Вставьте домен сайта (например, `random-name.trycloudflare.com` без `https://`)

Если используется Quick Tunnel, домен обычно меняется на каждом запуске, и `/setdomain` нужно повторять.

## 3) Запуск для теста (сразу сайт + туннель + бот)
```powershell
node .\scripts\dev-cloudflare-miniapp.js
```

Скрипт:
- поднимает `src/server/server.js`
- поднимает Cloudflare Tunnel
- ловит публичный `https://...trycloudflare.com`
- запускает `src/bot/bot.js` с этим URL как `WEBAPP_URL`

## 4) Ручной запуск (альтернатива)
Терминал 1:
```powershell
node .\src\server\server.js
```

Терминал 2:
```powershell
cloudflared tunnel --url http://127.0.0.1:3000 --no-autoupdate
```

Терминал 3:
```powershell
node .\src\bot\bot.js
```

## 5) Команды бота
- `/start` - приветствие + кнопка открытия Mini App
- `/app` - открыть Mini App
- `/help` - помощь
