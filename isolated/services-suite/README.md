# Services Suite (isolated)

This folder contains the extracted `/services` module from the main project:

- `src/web/services.html`
- `src/web/services.js`
- `src/web/services.css`
- `src/bot/services-bot.js`
- `src/shared/data-store.js` (copy used by services module)
- `src/web/admin.full.html`
- `src/web/admin.full.js`
- `src/web/admin.full.css`
- `deploy/ionos/systemd/ristoranti-services-bot-webhook.service`

## Notes

- Main project no longer serves `/services` and no longer includes Services page in Admin UI.
- Use this folder as a base for a standalone repository.
- Before standalone deploy, adapt imports/paths and create dedicated server/bootstrap files if needed.
