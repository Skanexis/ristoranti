const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

const APP_ROOT = path.resolve(__dirname, "..", "..");
loadEnvFile(path.join(APP_ROOT, ".env"));

const BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
const BOT_USERNAME = String(process.env.TELEGRAM_BOT_USERNAME || "")
  .trim()
  .replace(/^@/, "");
const WEBAPP_URL = normalizeWebAppUrl(process.env.WEBAPP_URL);
const BOT_MODE = String(process.env.TELEGRAM_BOT_MODE || "polling")
  .trim()
  .toLowerCase();
const POLL_TIMEOUT_SECONDS = Math.max(10, Number(process.env.TELEGRAM_POLL_TIMEOUT || 30));
const RETRY_DELAY_MS = Math.max(800, Number(process.env.TELEGRAM_RETRY_DELAY_MS || 1800));
const ALLOWED_USER_IDS = parseAllowedUserIds(process.env.TELEGRAM_ALLOWED_USER_IDS);

const WEBHOOK_BASE_URL = normalizeWebAppUrl(process.env.TELEGRAM_WEBHOOK_BASE_URL || WEBAPP_URL);
const WEBHOOK_PATH = normalizeWebhookPath(
  process.env.TELEGRAM_WEBHOOK_PATH || `/telegram/webhook/${crypto.createHash("sha256").update(BOT_TOKEN).digest("hex").slice(0, 24)}`
);
const WEBHOOK_SECRET = String(process.env.TELEGRAM_WEBHOOK_SECRET || BOT_TOKEN.slice(0, 32) || "ristoranti-webhook-secret")
  .trim()
  .slice(0, 256);
const WEBHOOK_BIND_HOST = String(process.env.TELEGRAM_WEBHOOK_BIND_HOST || "127.0.0.1").trim();
const WEBHOOK_BIND_PORT = Number(process.env.TELEGRAM_WEBHOOK_PORT || 3099);
const BODY_LIMIT_BYTES = 1_000_000;

if (!BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

if (!WEBAPP_URL || !WEBAPP_URL.startsWith("https://")) {
  console.error("WEBAPP_URL must be a public HTTPS URL for Telegram Mini App.");
  process.exit(1);
}

if (BOT_MODE === "webhook" && (!WEBHOOK_BASE_URL || !WEBHOOK_BASE_URL.startsWith("https://"))) {
  console.error("TELEGRAM_WEBHOOK_BASE_URL must be a public HTTPS URL in webhook mode.");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const BRAND_NAME = "Ristoranti d'Italia";
const WEB_APP_BUTTON_TEXT = BRAND_NAME;
const WEBHOOK_URL = BOT_MODE === "webhook" ? new URL(WEBHOOK_PATH, WEBHOOK_BASE_URL).toString() : "";

let updateOffset = 0;
let isStopping = false;
let webhookServer = null;

const startupInfo = [
  `${BRAND_NAME} bot started`,
  `- mode: ${BOT_MODE}`,
  `- web app: ${WEBAPP_URL}`,
  `- allow-list: ${ALLOWED_USER_IDS.length ? ALLOWED_USER_IDS.join(", ") : "disabled"}`,
];

if (BOT_MODE === "webhook") {
  startupInfo.push(`- webhook public: ${WEBHOOK_URL}`);
  startupInfo.push(`- webhook bind: http://${WEBHOOK_BIND_HOST}:${WEBHOOK_BIND_PORT}${WEBHOOK_PATH}`);
}

console.log(startupInfo.join("\n"));

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

void main();

async function main() {
  if (BOT_MODE === "webhook") {
    await configureBotCore();
    await configureWebhook();
    startWebhookServer();
    return;
  }

  await ensurePollingMode();
  await configureBotCore();
  await pollUpdates();
}

async function configureBotCore() {
  const commands = [
    { command: "start", description: "Apri pannello rapido" },
    { command: "app", description: "Apri Ristoranti d'Italia" },
    { command: "help", description: "Aiuto comandi" },
  ];

  try {
    await telegramApi("setMyCommands", { commands });
  } catch (error) {
    console.warn(`setMyCommands warning: ${error.message}`);
  }

  try {
    await telegramApi("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: BRAND_NAME,
        web_app: { url: WEBAPP_URL },
      },
    });
  } catch (error) {
    console.warn(`setChatMenuButton warning: ${error.message}`);
  }
}

async function configureWebhook() {
  try {
    await telegramApi("deleteWebhook", { drop_pending_updates: false });
  } catch (error) {
    console.warn(`deleteWebhook warning: ${error.message}`);
  }

  await telegramApi("setWebhook", {
    url: WEBHOOK_URL,
    secret_token: WEBHOOK_SECRET,
    drop_pending_updates: false,
    allowed_updates: ["message"],
  });

  console.log(`Webhook set: ${WEBHOOK_URL}`);
}

function startWebhookServer() {
  webhookServer = http.createServer(async (req, res) => {
    const method = (req.method || "GET").toUpperCase();
    const pathname = safePathname(req.url || "/");

    if (method === "GET" && pathname === "/health") {
      sendJson(res, 200, { ok: true, mode: "webhook", timestamp: new Date().toISOString() });
      return;
    }

    if (method !== "POST" || pathname !== WEBHOOK_PATH) {
      sendJson(res, 404, { error: "Not found." });
      return;
    }

    const secretHeader = String(req.headers["x-telegram-bot-api-secret-token"] || "");
    if (!secretHeader || secretHeader !== WEBHOOK_SECRET) {
      sendJson(res, 403, { error: "Forbidden." });
      return;
    }

    let body = "";
    let totalLength = 0;
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      totalLength += chunk.length;
      if (totalLength > BODY_LIMIT_BYTES) {
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on("end", () => {
      if (totalLength > BODY_LIMIT_BYTES) {
        sendJson(res, 413, { error: "Payload too large." });
        return;
      }

      sendJson(res, 200, { ok: true });

      try {
        const update = body ? JSON.parse(body) : {};
        void handleUpdate(update);
      } catch (error) {
        console.error(`webhook update parse error: ${error.message}`);
      }
    });

    req.on("error", (error) => {
      console.error(`webhook request error: ${error.message}`);
    });
  });

  webhookServer.listen(WEBHOOK_BIND_PORT, WEBHOOK_BIND_HOST, () => {
    console.log(`Webhook listener running on http://${WEBHOOK_BIND_HOST}:${WEBHOOK_BIND_PORT}${WEBHOOK_PATH}`);
  });
}

async function ensurePollingMode() {
  try {
    await telegramApi("deleteWebhook", { drop_pending_updates: false });
  } catch (error) {
    console.warn(`deleteWebhook warning: ${error.message}`);
  }
}

async function pollUpdates() {
  while (!isStopping) {
    try {
      const payload = await telegramApi("getUpdates", {
        timeout: POLL_TIMEOUT_SECONDS,
        offset: updateOffset,
        allowed_updates: ["message"],
      });

      const updates = Array.isArray(payload) ? payload : [];
      for (const update of updates) {
        updateOffset = Number(update.update_id || 0) + 1;
        await handleUpdate(update);
      }
    } catch (error) {
      if (isStopping) break;
      console.error(`polling error: ${error.message}`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

async function handleUpdate(update) {
  const msg = update?.message;
  if (!msg) return;

  const chatId = msg.chat?.id;
  const userId = msg.from?.id;
  if (!chatId || !userId) return;

  if (!isUserAllowed(userId)) {
    await sendMessage(chatId, "Accesso bot non autorizzato.");
    return;
  }

  if (msg.web_app_data?.data) {
    await sendMessage(chatId, "Dati Mini App ricevuti.");
    return;
  }

  const text = String(msg.text || "").trim();
  if (!text) return;

  const command = parseCommand(text);
  if (command === "/start") {
    const firstName = String(msg.from?.first_name || "").trim();
    const helloName = firstName ? `, ${firstName}` : "";
    await sendMessage(chatId, `Ciao${helloName}. Apri ${BRAND_NAME} dal pulsante qui sotto.`, {
      reply_markup: buildReplyKeyboard(),
    });
    await setPrivateMenuButton(chatId);
    return;
  }

  if (command === "/app" || command === "/mini") {
    await sendMessage(chatId, "Usa il pulsante della tastiera per aprire la mini app.", {
      reply_markup: buildReplyKeyboard(),
    });
    return;
  }

  if (command === "/help") {
    await sendMessage(
      chatId,
      ["/start - apre pannello rapido", "/app - apre Ristoranti d'Italia", "/help - mostra aiuto"].join("\n")
    );
    return;
  }

  if (text === WEB_APP_BUTTON_TEXT) {
    await sendMessage(chatId, "Se il pulsante non ha aperto l'app, usa /app.");
    return;
  }

  await sendMessage(chatId, "Comando non riconosciuto. Usa /start o /app.");
}

function buildReplyKeyboard() {
  return {
    keyboard: [[{ text: WEB_APP_BUTTON_TEXT, web_app: { url: WEBAPP_URL } }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

async function setPrivateMenuButton(chatId) {
  try {
    await telegramApi("setChatMenuButton", {
      chat_id: chatId,
      menu_button: {
        type: "web_app",
        text: BRAND_NAME,
        web_app: { url: WEBAPP_URL },
      },
    });
  } catch {
    // Ignore menu setup issues for unsupported clients/chats.
  }
}

async function sendMessage(chatId, text, extra = {}) {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...extra,
  });
}

async function telegramApi(method, payload = {}) {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok || !parsed?.ok) {
    const message = parsed?.description || `HTTP ${response.status}`;
    throw new Error(`${method} failed: ${message}`);
  }

  return parsed.result;
}

function parseCommand(text) {
  if (!text.startsWith("/")) return "";
  const firstToken = text.split(/\s+/)[0].trim();
  const command = firstToken.split("@")[0].toLowerCase();
  if (!BOT_USERNAME) return command;

  const mentionPart = firstToken.includes("@") ? firstToken.split("@")[1].toLowerCase() : "";
  if (mentionPart && mentionPart !== BOT_USERNAME.toLowerCase()) {
    return "";
  }
  return command;
}

function parseAllowedUserIds(raw) {
  const source = String(raw || "").trim();
  if (!source) return [];
  return source
    .split(",")
    .map((part) => Number(String(part).trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function isUserAllowed(userId) {
  if (!ALLOWED_USER_IDS.length) return true;
  return ALLOWED_USER_IDS.includes(Number(userId));
}

function normalizeWebAppUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).toString();
  } catch {
    return "";
  }
}

function normalizeWebhookPath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "/telegram/webhook";
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

function safePathname(urlValue) {
  try {
    return new URL(urlValue, "http://127.0.0.1").pathname || "/";
  } catch {
    return "/";
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    if (!key) continue;

    let value = line.slice(eqIndex + 1).trim();
    const hasSingleQuotes = value.startsWith("'") && value.endsWith("'");
    const hasDoubleQuotes = value.startsWith('"') && value.endsWith('"');
    if ((hasSingleQuotes || hasDoubleQuotes) && value.length >= 2) {
      value = value.slice(1, -1);
    }

    if (typeof process.env[key] === "undefined") {
      process.env[key] = value;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shutdown() {
  if (isStopping) return;
  isStopping = true;
  console.log("Stopping bot...");

  if (webhookServer) {
    webhookServer.close(() => process.exit(0));
    return;
  }

  process.exit(0);
}
