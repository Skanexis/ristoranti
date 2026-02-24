# Ristoranti d'Italia Mini App

## Project structure
```text
.
|- data/                     # Runtime data + media uploads (site-data.json, admin-auth.json, uploads/)
|- deploy/ionos/             # Nginx + systemd + env templates for VPS deploy
|- scripts/
|  |- dev-cloudflare-miniapp.js
|  `- generate-admin-hash.js
`- src/
   |- bot/
   |  `- bot.js
   |- server/
   |  `- server.js
   |- shared/
   |  `- data-store.js
   `- web/
      |- index.html
      |- admin.html
      |- styles.css
      |- script.js
      |- admin.css
      |- admin.js
      `- assets/
```

## Local run
- Site: `node src/server/server.js`
- Bot: `node src/bot/bot.js`
- Cloudflare + Mini App test: `node scripts/dev-cloudflare-miniapp.js`

## Production deploy (IONOS)
Use one unified guide:
- `deploy/ionos/DEPLOY_IONOS.md`

## Security helper
Generate admin hash for `.env`:
```bash
node scripts/generate-admin-hash.js "YourStrongPassword123!" admin
```
