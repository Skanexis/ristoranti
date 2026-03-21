const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

const dataStore = require("../shared/data-store.js");

const APP_ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(APP_ROOT, "data");
const SITE_DATA_FILE = path.join(DATA_DIR, "site-data.json");
const LEADS_FILE = path.join(DATA_DIR, "services-leads.json");
const OPERATOR_SESSIONS_FILE = path.join(DATA_DIR, "services-operator-sessions.json");
loadEnvFile(path.join(APP_ROOT, ".env"));

const BOT_TOKEN = String(process.env.TELEGRAM_SERVICES_BOT_TOKEN || "").trim();
const BOT_USERNAME = String(process.env.TELEGRAM_SERVICES_BOT_USERNAME || "")
  .trim()
  .replace(/^@/, "");
const BOT_MODE = String(process.env.TELEGRAM_SERVICES_BOT_MODE || "polling")
  .trim()
  .toLowerCase();
const POLL_TIMEOUT_SECONDS = Math.max(10, Number(process.env.TELEGRAM_SERVICES_POLL_TIMEOUT || 30));
const RETRY_DELAY_MS = Math.max(800, Number(process.env.TELEGRAM_SERVICES_RETRY_DELAY_MS || 1800));
const ALLOWED_USER_IDS = parseAllowedUserIds(process.env.TELEGRAM_SERVICES_ALLOWED_USER_IDS);

const SERVICES_PAGE_URL = resolveServicesPageUrl();
const CONTACT_LINK = resolveContactLink();
const ADMIN_CHAT_ID = Number(process.env.TELEGRAM_SERVICES_ADMIN_CHAT_ID || 0) || 0;
const OPERATOR_GROUP_ID = Number(process.env.TELEGRAM_SERVICES_OPERATOR_GROUP_ID || 0) || 0;
const OPERATOR_USER_IDS = parseAllowedUserIds(process.env.TELEGRAM_SERVICES_OPERATOR_USER_IDS);

const OPENAI_API_KEY = String(process.env.SERVICES_BOT_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL_OVERRIDE = String(process.env.SERVICES_BOT_OPENAI_MODEL || "").trim();
const OPENAI_BASE_URL = normalizeOpenAiBaseUrl(process.env.SERVICES_BOT_OPENAI_BASE_URL || "https://api.openai.com/v1");
const OPENAI_TIMEOUT_MS = Math.max(5000, Number(process.env.SERVICES_BOT_OPENAI_TIMEOUT_MS || 25000));
const RUN_SELFTEST = String(process.env.SERVICES_BOT_SELFTEST || "").trim() === "1";

const WEBHOOK_BASE_URL = normalizeUrl(process.env.TELEGRAM_SERVICES_WEBHOOK_BASE_URL);
const WEBHOOK_PATH = normalizeWebhookPath(
  process.env.TELEGRAM_SERVICES_WEBHOOK_PATH ||
    `/telegram/services-webhook/${crypto.createHash("sha256").update(BOT_TOKEN).digest("hex").slice(0, 24)}`
);
const WEBHOOK_SECRET = String(
  process.env.TELEGRAM_SERVICES_WEBHOOK_SECRET || BOT_TOKEN.slice(0, 32) || "services-bot-webhook-secret"
)
  .trim()
  .slice(0, 256);
const WEBHOOK_BIND_HOST = String(process.env.TELEGRAM_SERVICES_WEBHOOK_BIND_HOST || "127.0.0.1").trim();
const WEBHOOK_BIND_PORT = Number(process.env.TELEGRAM_SERVICES_WEBHOOK_PORT || 3100);
const BODY_LIMIT_BYTES = 1_000_000;

if (!BOT_TOKEN && !RUN_SELFTEST) {
  console.error("Missing TELEGRAM_SERVICES_BOT_TOKEN in .env");
  process.exit(1);
}

if (!RUN_SELFTEST && BOT_MODE === "webhook" && (!WEBHOOK_BASE_URL || !WEBHOOK_BASE_URL.startsWith("https://"))) {
  console.error("TELEGRAM_SERVICES_WEBHOOK_BASE_URL must be a public HTTPS URL in webhook mode.");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const BRAND_NAME = "YOSUPPORT Services";
const OPEN_SERVICES_LABEL = "Apri pagina servizi";
const WEBHOOK_URL = BOT_MODE === "webhook" ? new URL(WEBHOOK_PATH, WEBHOOK_BASE_URL).toString() : "";
const INTENT_KEYWORD_SETS = {
  exchange_crypto: [
    "exchange",
    "crypto",
    "commissioni",
    "commissione",
    "commission",
    "fee",
    "spread",
    "fascia",
    "percentuale",
    "percent",
    "usdt",
    "btc",
    "eth",
    "swap",
  ],
  exchange_accounts: [
    "account exchange",
    "conto exchange",
    "binance",
    "coinbase",
    "kucoin",
    "bybit",
    "bitget",
    "kraken",
    "wirex",
    "trade republic",
    "robinhood",
  ],
  banking_accounts: [
    "banca",
    "banche",
    "conti",
    "conto",
    "account bancario",
    "account bancari",
    "iban",
    "wallet",
    "intesa",
    "unicredit",
    "postepay",
    "revolut",
    "n26",
    "fineco",
  ],
  programming_bots: [
    "bot",
    "bots",
    "moderazione",
    "anti scam",
    "antiscam",
    "chat",
    "menu multimediale",
    "community",
    "telegram bot",
    "automation",
    "automazioni",
  ],
  miniapp_web: [
    "mini app",
    "miniapp",
    "sito",
    "sito web",
    "website",
    "web app",
    "webapp",
    "sviluppo web",
    "frontend",
    "backend",
    "telegram mini app",
  ],
  pricing: [
    "prezzo",
    "prezzi",
    "costo",
    "costi",
    "tariffa",
    "tariffe",
    "quanto",
    "listino",
    "price",
  ],
};
const SERVICE_INTENT_HINTS = {
  "chat-moderation-bots": ["programming_bots"],
  "antiscam-community-bots": ["programming_bots"],
  "advanced-multimedia-menu-bots": ["programming_bots"],
  "telegram-miniapp-web-bot-suite": ["miniapp_web", "programming_bots"],
  "crypto-exchange-services": ["exchange_crypto"],
  "exchange-accounts-services": ["exchange_accounts"],
  "bank-accounts-and-crypto-wallets": ["banking_accounts"],
};

const conversationState = new Map();
const operatorSessions = [];
const operatorSessionByUserChat = new Map();
const operatorSessionByThread = new Map();
let updateOffset = 0;
let isStopping = false;
let webhookServer = null;

const startupInfo = [
  `${BRAND_NAME} AI bot started`,
  `- mode: ${BOT_MODE}`,
  `- services page: ${SERVICES_PAGE_URL || "not set"}`,
  `- ai key: ${OPENAI_API_KEY ? "configured" : "missing (fallback mode)"}`,
  `- allow-list: ${ALLOWED_USER_IDS.length ? ALLOWED_USER_IDS.join(", ") : "disabled"}`,
  `- operator group: ${OPERATOR_GROUP_ID || "not configured"}`,
  `- operator allow-list: ${OPERATOR_USER_IDS.length ? OPERATOR_USER_IDS.join(", ") : "all members"}`,
];

if (BOT_MODE === "webhook") {
  startupInfo.push(`- webhook public: ${WEBHOOK_URL}`);
  startupInfo.push(`- webhook bind: http://${WEBHOOK_BIND_HOST}:${WEBHOOK_BIND_PORT}${WEBHOOK_PATH}`);
}

console.log(startupInfo.join("\n"));

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

if (!RUN_SELFTEST) {
  loadOperatorSessionsState();
}

if (RUN_SELFTEST) {
  runSelfTest();
  process.exit(0);
}

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
  try {
    await telegramApi("setMyCommands", { commands: [] });
  } catch (error) {
    console.warn(`setMyCommands warning: ${error.message}`);
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

  pruneConversationState();
  pruneOperatorSessionIndexes();

  if (isOperatorGroupMessage(chatId)) {
    await handleOperatorGroupMessage(msg);
    return;
  }

  if (msg.chat?.type !== "private") {
    return;
  }

  if (!isUserAllowed(userId)) {
    await sendMessage(chatId, "Accesso bot non autorizzato.");
    return;
  }

  await handlePrivateUserMessage(msg);
}

async function handlePrivateUserMessage(msg) {
  const chatId = Number(msg.chat?.id || 0);
  if (!chatId) return;

  const text = extractIncomingText(msg);
  if (!text) return;

  const normalizedData = loadNormalizedData();
  const services = getServiceBlocks(normalizedData);
  const botConfig = getServicesBotConfig(normalizedData);
  const state = ensureConversationState(chatId);
  const command = parseCommand(text);
  const activeSession = getActiveOperatorSessionByUserChat(chatId);

  if (activeSession) {
    mergeLead(state.lead, extractLeadHintsFromText(text, services));
    pushConversationTurn(state, "user", text);
    appendSessionTranscript(activeSession, "cliente", text);
    activeSession.lead = { ...activeSession.lead, ...cloneLeadState(state.lead) };
    activeSession.phase = describeLeadPhase(state.lead);
    activeSession.updatedAt = new Date().toISOString();
    saveOperatorSessionsState();

    try {
      await sendOperatorTopicMessage(
        activeSession.topicThreadId,
        buildOperatorRelayClientMessage({
          userText: text,
          lead: state.lead,
          username: sanitizeText(msg.from?.username),
          userId: Number(msg.from?.id || 0),
        })
      );
    } catch (error) {
      console.warn(`operator relay warning: ${error.message}`);
      await sendMessage(chatId, "Connessione operatore temporaneamente non disponibile. Riprova tra poco.");
      return;
    }

    if (command === "/start" || command === "/help") {
      await sendMessage(chatId, "Chat operatore attiva. Scrivi qui e l'operatore ti risponde direttamente in questa chat.");
    }
    return;
  }

  if (command === "/start" || command === "/help") {
    resetConversationState(chatId);
    const freshState = ensureConversationState(chatId);
    const welcome = buildWelcomeMessage(msg, botConfig);
    pushConversationTurn(freshState, "assistant", welcome);
    await sendMessage(chatId, welcome, { reply_markup: buildHomeKeyboard(botConfig) });
    return;
  }

  if (isOpenServicesIntent(text)) {
    const servicesMessage = SERVICES_PAGE_URL ? `Pagina servizi: ${SERVICES_PAGE_URL}` : "Pagina servizi non configurata.";
    pushConversationTurn(state, "assistant", servicesMessage);
    await sendMessage(chatId, servicesMessage, { reply_markup: buildHomeKeyboard(botConfig) });
    return;
  }

  if (isOperatorIntent(text, botConfig)) {
    await handleOperatorEscalation(chatId, msg, state, botConfig, "Richiesta diretta operatore");
    return;
  }

  mergeLead(state.lead, extractLeadHintsFromText(text, services));
  pushConversationTurn(state, "user", text);
  const conversationContext = inferConversationContext(text, state, services);
  updateConversationContextProfile(state, conversationContext);

  const correctedReply = findCorrectionReply(text, botConfig.correctionRules);
  let aiOutcome = null;
  let replyText = "";

  if (correctedReply) {
    replyText = correctedReply;
  } else {
    const grounded = buildGroundedReply(text, services, state.lead, conversationContext);
    if (grounded?.leadUpdates) {
      mergeLead(state.lead, grounded.leadUpdates);
    }
    replyText = sanitizeText(grounded?.reply);
  }

  if (!replyText && botConfig.enabled && OPENAI_API_KEY) {
    aiOutcome = await generateAiReply({
      userText: text,
      state,
      services,
      botConfig,
      conversationContext,
    });
    if (aiOutcome?.leadUpdates) {
      mergeLead(state.lead, aiOutcome.leadUpdates);
    }
    if (aiOutcome?.needsOperator) {
      await handleOperatorEscalation(chatId, msg, state, botConfig, "Escalation AI");
      return;
    }
    replyText = sanitizeText(aiOutcome?.reply);
  }

  if (!replyText) {
    replyText = buildFallbackReply(text, state.lead, services);
  }

  const leadSaved = await maybePersistLead(chatId, msg, state, botConfig);
  if (leadSaved) {
    replyText = `${replyText}\n\nPerfetto. Ho registrato la tua richiesta e il team ti contattera a breve.`;
  }

  pushConversationTurn(state, "assistant", replyText);
  await sendMessage(chatId, replyText, { reply_markup: buildHomeKeyboard(botConfig) });
}

async function handleOperatorGroupMessage(msg) {
  const operatorId = Number(msg.from?.id || 0);
  if (!operatorId || !isOperatorAllowed(operatorId)) {
    return;
  }

  const text = extractIncomingText(msg);
  const command = parseCommand(text);
  const threadId = Number(msg.message_thread_id || 0);
  const isTopicMessage = Boolean(msg.is_topic_message && threadId > 0);

  if (msg.forum_topic_closed && threadId > 0) {
    await closeOperatorSessionByThread(threadId, "closed-manually", true);
    return;
  }

  if (!isTopicMessage) {
    if (command === "/tickets") {
      const arg = sanitizeText(text.split(/\s+/).slice(1).join(" ")).toLowerCase();
      const mode = arg === "closed" || arg === "active" || arg === "all" ? arg : "all";
      await sendMessage(OPERATOR_GROUP_ID, buildOperatorTicketsSummary(mode));
      return;
    }
    if (command === "/help") {
      await sendMessage(
        OPERATOR_GROUP_ID,
        [
          "Comandi operatore:",
          "/tickets [active|closed|all] - elenco ticket ordinato",
          "Dentro un topic ticket: /history, /lead, /close",
        ].join("\n")
      );
    }
    return;
  }

  const session = getSessionByThreadId(threadId);
  if (!session) {
    if (command === "/tickets") {
      await sendMessage(OPERATOR_GROUP_ID, buildOperatorTicketsSummary("all"), { message_thread_id: threadId });
    }
    return;
  }

  if (command === "/history") {
    await sendMessage(OPERATOR_GROUP_ID, buildSessionHistoryReply(session), { message_thread_id: threadId });
    return;
  }

  if (command === "/lead") {
    await sendMessage(OPERATOR_GROUP_ID, buildSessionLeadSummary(session), { message_thread_id: threadId });
    return;
  }

  if (command === "/close") {
    await closeOperatorSessionByThread(threadId, "closed-by-operator", true);
    return;
  }

  if (!text) return;
  if (session.status !== "active") {
    await sendMessage(OPERATOR_GROUP_ID, "Questo ticket e chiuso. Usa /tickets per l'elenco.", { message_thread_id: threadId });
    return;
  }

  const clientChatId = Number(session.userChatId || 0);
  if (!clientChatId) return;

  appendSessionTranscript(session, "operatore", text);
  session.updatedAt = new Date().toISOString();
  saveOperatorSessionsState();

  try {
    await sendMessage(clientChatId, text, {
      reply_markup: buildHomeKeyboard(getServicesBotConfig(loadNormalizedData())),
    });
  } catch (error) {
    console.warn(`operator->client relay warning: ${error.message}`);
    await sendMessage(OPERATOR_GROUP_ID, "Invio al cliente fallito. Verifica che la chat utente sia ancora disponibile.", {
      message_thread_id: threadId,
    });
  }
}

function ensureConversationState(chatId) {
  const existing = conversationState.get(chatId);
  if (existing) {
    existing.updatedAt = Date.now();
    return existing;
  }

  const state = {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
    contextProfile: {
      lastPrimaryIntent: "",
      intentScores: {},
      lastServiceCandidates: [],
      lastQueryStyle: "generic",
    },
    lead: {
      name: "",
      service: "",
      budget: "",
      details: "",
      contact: "",
    },
    lastLeadSignature: "",
    lastLeadAt: "",
  };
  conversationState.set(chatId, state);
  return state;
}

function resetConversationState(chatId) {
  conversationState.delete(chatId);
}

function pruneConversationState() {
  const now = Date.now();
  for (const [chatId, state] of conversationState.entries()) {
    if (!state || !Number.isFinite(state.updatedAt)) {
      conversationState.delete(chatId);
      continue;
    }
    if (now - state.updatedAt > 1000 * 60 * 60 * 24 * 3) {
      conversationState.delete(chatId);
    }
  }
}

function pruneOperatorSessionIndexes() {
  rebuildOperatorSessionIndexes();
}

function isOperatorGroupMessage(chatId) {
  if (!OPERATOR_GROUP_ID) return false;
  return Number(chatId) === Number(OPERATOR_GROUP_ID);
}

function isOperatorAllowed(userId) {
  if (!OPERATOR_USER_IDS.length) return true;
  return OPERATOR_USER_IDS.includes(Number(userId));
}

function loadOperatorSessionsState() {
  operatorSessions.length = 0;
  const loaded = readOperatorSessionsFromFile();
  loaded.forEach((session) => operatorSessions.push(session));
  rebuildOperatorSessionIndexes();
}

function readOperatorSessionsFromFile() {
  if (!fs.existsSync(OPERATOR_SESSIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(OPERATOR_SESSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed?.sessions) ? parsed.sessions : Array.isArray(parsed) ? parsed : [];
    return rows.map((entry, index) => normalizeOperatorSession(entry, index)).filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeOperatorSession(source, index = 0) {
  const row = source && typeof source === "object" ? source : null;
  if (!row) return null;

  const id = sanitizeText(row.id) || `ops_${Date.now()}_${index + 1}`;
  const userChatId = Number(row.userChatId || 0);
  const topicThreadId = Number(row.topicThreadId || row.threadId || 0);
  if (!userChatId || !topicThreadId) return null;

  const status = sanitizeText(row.status).toLowerCase() === "closed" ? "closed" : "active";
  const transcriptSource = Array.isArray(row.transcript) ? row.transcript : [];
  const transcript = transcriptSource
    .map((item) => {
      const actor = sanitizeText(item?.actor || item?.role || "");
      const text = sanitizeText(item?.text || item?.message || "");
      if (!actor || !text) return null;
      return {
        actor,
        text: text.slice(0, 2000),
        at: sanitizeText(item?.at) || new Date().toISOString(),
      };
    })
    .filter(Boolean)
    .slice(-220);

  return {
    id,
    userChatId,
    userId: Number(row.userId || 0),
    username: sanitizeText(row.username),
    customerName: sanitizeText(row.customerName),
    topicThreadId,
    topicName: sanitizeText(row.topicName),
    status,
    phase: sanitizeText(row.phase),
    reason: sanitizeText(row.reason),
    lead: normalizeLeadUpdates(row.lead),
    createdAt: sanitizeText(row.createdAt) || new Date().toISOString(),
    updatedAt: sanitizeText(row.updatedAt) || sanitizeText(row.createdAt) || new Date().toISOString(),
    closedAt: sanitizeText(row.closedAt),
    transcript,
  };
}

function rebuildOperatorSessionIndexes() {
  operatorSessionByUserChat.clear();
  operatorSessionByThread.clear();

  operatorSessions.sort((a, b) => {
    const left = Date.parse(a.createdAt || 0) || 0;
    const right = Date.parse(b.createdAt || 0) || 0;
    return left - right;
  });

  for (const session of operatorSessions) {
    if (!session) continue;
    operatorSessionByThread.set(Number(session.topicThreadId), session);
    if (session.status === "active") {
      operatorSessionByUserChat.set(Number(session.userChatId), session);
    }
  }
}

function saveOperatorSessionsState() {
  ensureDataDirectory();
  const payload = {
    sessions: operatorSessions.map((session) => ({
      id: session.id,
      userChatId: session.userChatId,
      userId: session.userId,
      username: session.username,
      customerName: session.customerName,
      topicThreadId: session.topicThreadId,
      topicName: session.topicName,
      status: session.status,
      phase: session.phase,
      reason: session.reason,
      lead: session.lead,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      closedAt: session.closedAt,
      transcript: Array.isArray(session.transcript) ? session.transcript.slice(-220) : [],
    })),
    updatedAt: new Date().toISOString(),
  };

  const tempFile = `${OPERATOR_SESSIONS_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), "utf8");
  fs.renameSync(tempFile, OPERATOR_SESSIONS_FILE);
  rebuildOperatorSessionIndexes();
}

function getActiveOperatorSessionByUserChat(userChatId) {
  return operatorSessionByUserChat.get(Number(userChatId)) || null;
}

function getSessionByThreadId(threadId) {
  return operatorSessionByThread.get(Number(threadId)) || null;
}

function appendSessionTranscript(session, actor, text) {
  if (!session || !actor) return;
  const clean = sanitizeText(text);
  if (!clean) return;
  if (!Array.isArray(session.transcript)) {
    session.transcript = [];
  }

  session.transcript.push({
    actor: sanitizeText(actor).toLowerCase(),
    text: clean.slice(0, 2000),
    at: new Date().toISOString(),
  });
  if (session.transcript.length > 220) {
    session.transcript = session.transcript.slice(-220);
  }
}

function cloneLeadState(lead) {
  return normalizeLeadUpdates(lead || {});
}

async function createOperatorSession({ chatId, msg, state, reason }) {
  const existing = getActiveOperatorSessionByUserChat(chatId);
  if (existing) return existing;
  if (!OPERATOR_GROUP_ID) return null;

  const fallbackName = sanitizeText(msg?.from?.first_name) || sanitizeText(msg?.from?.username) || `User ${chatId}`;
  const topicName = buildTopicName(fallbackName, state?.lead?.service);
  const createdTopic = await telegramApi("createForumTopic", {
    chat_id: OPERATOR_GROUP_ID,
    name: topicName,
  });
  const threadId = Number(createdTopic?.message_thread_id || 0);
  if (!threadId) {
    throw new Error("createForumTopic failed: missing message_thread_id");
  }

  const now = new Date().toISOString();
  const session = {
    id: `ops_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    userChatId: Number(chatId),
    userId: Number(msg?.from?.id || 0),
    username: sanitizeText(msg?.from?.username),
    customerName: fallbackName,
    topicThreadId: threadId,
    topicName,
    status: "active",
    phase: describeLeadPhase(state?.lead),
    reason: sanitizeText(reason),
    lead: cloneLeadState(state?.lead),
    createdAt: now,
    updatedAt: now,
    closedAt: "",
    transcript: [],
  };

  const stateHistory = Array.isArray(state?.history) ? state.history.slice(-16) : [];
  stateHistory.forEach((turn) => {
    appendSessionTranscript(session, turn.role === "assistant" ? "bot" : "cliente", turn.text);
  });

  operatorSessions.push(session);
  saveOperatorSessionsState();

  await sendOperatorTopicMessage(threadId, buildOperatorSessionIntro(session, stateHistory));
  return session;
}

async function sendOperatorTopicMessage(threadId, text) {
  await sendMessage(OPERATOR_GROUP_ID, text, { message_thread_id: Number(threadId) });
}

function buildTopicName(customerName, serviceName) {
  const shortCustomer = sanitizeText(customerName).slice(0, 40) || "Cliente";
  const shortService = sanitizeText(serviceName).slice(0, 56);
  const base = shortService ? `${shortCustomer} • ${shortService}` : shortCustomer;
  return `Ticket ${base}`.slice(0, 120);
}

function buildOperatorSessionIntro(session, stateHistory) {
  const lines = [
    "Nuovo ticket operatore",
    `ID ticket: ${session.id}`,
    `Cliente chat: ${session.userChatId} (${session.username ? `@${session.username}` : "senza username"})`,
    `Fase chiamata: ${session.phase || "n/d"}`,
    `Motivo handoff: ${session.reason || "n/d"}`,
    `Nome raccolto: ${sanitizeText(session.lead?.name) || "-"}`,
    `Servizio: ${sanitizeText(session.lead?.service) || "-"}`,
    `Budget: ${sanitizeText(session.lead?.budget) || "-"}`,
    `Contatto: ${sanitizeText(session.lead?.contact) || "-"}`,
    `Dettagli: ${sanitizeText(session.lead?.details) || "-"}`,
    "",
    "Comandi topic: /history, /lead, /close",
  ];

  if (Array.isArray(stateHistory) && stateHistory.length) {
    lines.push("");
    lines.push("Ultimi messaggi:");
    stateHistory.slice(-8).forEach((turn) => {
      const role = turn.role === "assistant" ? "Bot" : "Cliente";
      lines.push(`- ${role}: ${sanitizeText(turn.text).slice(0, 220)}`);
    });
  }

  return lines.join("\n");
}

function buildOperatorRelayClientMessage({ userText, lead, username, userId }) {
  const lines = [
    "Messaggio cliente",
    `Cliente: ${username ? `@${username}` : "senza username"} (ID ${userId || "-"})`,
    `Fase: ${describeLeadPhase(lead)}`,
    `Testo: ${sanitizeText(userText)}`,
  ];

  const contact = sanitizeText(lead?.contact);
  if (contact) {
    lines.push(`Contatto rilevato: ${contact}`);
  }

  return lines.join("\n");
}

function describeLeadPhase(lead) {
  const safe = lead && typeof lead === "object" ? lead : {};
  const hasName = Boolean(sanitizeText(safe.name));
  const hasService = Boolean(sanitizeText(safe.service));
  const hasDetails = Boolean(sanitizeText(safe.details));
  const hasContact = Boolean(sanitizeText(safe.contact));

  if (hasName && hasService && hasDetails && hasContact) {
    return "qualifica completata";
  }
  if (hasService && hasDetails && !hasContact) {
    return "in attesa contatto";
  }
  if (hasService && !hasDetails) {
    return "raccolta dettagli progetto";
  }
  if (!hasService) {
    return "identificazione servizio";
  }
  return "raccolta iniziale";
}

function buildSessionHistoryReply(session) {
  const rows = Array.isArray(session?.transcript) ? session.transcript : [];
  if (!rows.length) {
    return "Nessuna cronologia disponibile.";
  }

  const lines = [`Cronologia ticket ${session.id}:`];
  rows.slice(-80).forEach((row) => {
    const who =
      row.actor === "cliente"
        ? "Cliente"
        : row.actor === "operatore"
          ? "Operatore"
          : row.actor === "bot"
            ? "Bot"
            : "Sistema";
    lines.push(`- ${who}: ${sanitizeText(row.text).slice(0, 220)}`);
  });
  return lines.join("\n");
}

function buildSessionLeadSummary(session) {
  return [
    `Ticket: ${session.id}`,
    `Stato: ${session.status}`,
    `Fase: ${session.phase || "-"}`,
    `Nome: ${sanitizeText(session?.lead?.name) || "-"}`,
    `Servizio: ${sanitizeText(session?.lead?.service) || "-"}`,
    `Budget: ${sanitizeText(session?.lead?.budget) || "-"}`,
    `Contatto: ${sanitizeText(session?.lead?.contact) || "-"}`,
    `Dettagli: ${sanitizeText(session?.lead?.details) || "-"}`,
  ].join("\n");
}

function buildOperatorTicketsSummary(mode = "all") {
  const active = operatorSessions
    .filter((session) => session.status === "active")
    .sort((a, b) => (Date.parse(b.updatedAt || 0) || 0) - (Date.parse(a.updatedAt || 0) || 0));
  const closed = operatorSessions
    .filter((session) => session.status === "closed")
    .sort((a, b) => (Date.parse(b.closedAt || b.updatedAt || 0) || 0) - (Date.parse(a.closedAt || a.updatedAt || 0) || 0));

  const lines = ["Ticket operatori"];
  if (mode === "all" || mode === "active") {
    lines.push(`Attivi: ${active.length}`);
    active.slice(0, 20).forEach((session) => {
      lines.push(
        `- ${session.id} | thread ${session.topicThreadId} | ${session.customerName || session.userChatId} | ${session.phase || "-"}`
      );
    });
  }

  if (mode === "all" || mode === "closed") {
    lines.push(`Chiusi: ${closed.length}`);
    closed.slice(0, 20).forEach((session) => {
      lines.push(
        `- ${session.id} | thread ${session.topicThreadId} | ${session.customerName || session.userChatId} | chiuso ${formatShortDate(
          session.closedAt || session.updatedAt
        )}`
      );
    });
  }

  if (lines.length <= 3) {
    lines.push("Nessun ticket disponibile.");
  }

  return lines.join("\n");
}

function formatShortDate(value) {
  const parsed = Date.parse(sanitizeText(value));
  if (!parsed) return "-";
  const date = new Date(parsed);
  return date.toISOString().replace("T", " ").slice(0, 16);
}

async function closeOperatorSessionByThread(threadId, reason = "closed", notifyUser = true) {
  const session = getSessionByThreadId(threadId);
  if (!session || session.status === "closed") return;

  session.status = "closed";
  session.reason = sanitizeText(reason) || session.reason;
  session.closedAt = new Date().toISOString();
  session.updatedAt = session.closedAt;
  appendSessionTranscript(session, "sistema", `Ticket chiuso (${session.reason || "closed"})`);
  saveOperatorSessionsState();

  try {
    await telegramApi("closeForumTopic", {
      chat_id: OPERATOR_GROUP_ID,
      message_thread_id: Number(threadId),
    });
  } catch (error) {
    console.warn(`closeForumTopic warning: ${error.message}`);
  }

  if (notifyUser && session.userChatId) {
    try {
      await sendMessage(
        session.userChatId,
        "La chat con l'operatore e stata chiusa. Se vuoi puoi continuare qui e il bot ti assiste subito."
      );
    } catch (error) {
      console.warn(`close notify user warning: ${error.message}`);
    }
  }
}

function pushConversationTurn(state, role, text) {
  if (!state || !role) return;
  const clean = sanitizeText(text);
  if (!clean) return;

  state.history.push({
    role: role === "assistant" ? "assistant" : "user",
    text: clean.slice(0, 1200),
    at: new Date().toISOString(),
  });
  if (state.history.length > 16) {
    state.history = state.history.slice(-16);
  }
  state.updatedAt = Date.now();
}

function buildWelcomeMessage(msg, botConfig) {
  const firstName = sanitizeText(msg?.from?.first_name);
  const suffix = firstName ? ` ${firstName}` : "";
  const operatorLabel = botConfig.operatorLabel || "Parla con operatore";

  return [
    `Ciao${suffix}, sono ${botConfig.assistantName}.`,
    "Scrivimi liberamente: ti rispondo sui servizi e preparo la richiesta ordine in chat.",
    `In qualsiasi momento puoi usare il pulsante "${operatorLabel}" per passare a un operatore umano.`,
  ].join("\n");
}

function buildHomeKeyboard(botConfig) {
  const operatorLabel = sanitizeText(botConfig.operatorLabel) || "Parla con operatore";
  const rows = [[{ text: operatorLabel }]];
  rows.push([{ text: OPEN_SERVICES_LABEL }]);

  return {
    keyboard: rows,
    resize_keyboard: true,
    is_persistent: true,
  };
}

function isOpenServicesIntent(text) {
  const normalized = sanitizeText(text).toLowerCase();
  if (!normalized) return false;
  return normalized === OPEN_SERVICES_LABEL.toLowerCase() || normalized === "apri servizi";
}

function isOperatorIntent(text, botConfig) {
  const normalized = sanitizeText(text).toLowerCase();
  if (!normalized) return false;

  if (normalized === sanitizeText(botConfig.operatorLabel).toLowerCase()) {
    return true;
  }

  const keywords = Array.isArray(botConfig.handoffKeywords) ? botConfig.handoffKeywords : [];
  if (keywords.some((keyword) => keyword && normalized.includes(keyword.toLowerCase()))) {
    return true;
  }

  const command = parseCommand(normalized);
  return command === "/operatore" || command === "/operator";
}

async function handleOperatorEscalation(chatId, msg, state, botConfig, reason) {
  if (!OPERATOR_GROUP_ID) {
    const operatorUrl = botConfig.operatorUrl || CONTACT_LINK || SERVICES_PAGE_URL || "https://t.me";
    const text = `${botConfig.operatorFallbackMessage}\n${operatorUrl}`;
    pushConversationTurn(state, "assistant", text);
    await sendMessage(chatId, text, { reply_markup: buildHomeKeyboard(botConfig) });
    await notifyAdminOperatorRequest(msg, state, reason, operatorUrl);
    return;
  }

  let session = getActiveOperatorSessionByUserChat(chatId);
  if (!session) {
    try {
      session = await createOperatorSession({
        chatId,
        msg,
        state,
        reason,
      });
    } catch (error) {
      console.warn(`create operator session warning: ${error.message}`);
      const operatorUrl = botConfig.operatorUrl || CONTACT_LINK || SERVICES_PAGE_URL || "https://t.me";
      const fallbackText = `${botConfig.operatorFallbackMessage}\n${operatorUrl}`;
      pushConversationTurn(state, "assistant", fallbackText);
      await sendMessage(chatId, fallbackText, { reply_markup: buildHomeKeyboard(botConfig) });
      await notifyAdminOperatorRequest(msg, state, `${reason} (topic-create-fallback)`, operatorUrl);
      return;
    }
  }

  session.phase = describeLeadPhase(state.lead);
  session.lead = cloneLeadState(state.lead);
  session.reason = sanitizeText(reason) || session.reason;
  session.updatedAt = new Date().toISOString();
  appendSessionTranscript(session, "sistema", `Escalation richiesta (${session.reason || "operatore"})`);
  saveOperatorSessionsState();

  try {
    await sendOperatorTopicMessage(
      session.topicThreadId,
      [
        "Escalation cliente ricevuta",
        `Motivo: ${session.reason || "-"}`,
        `Fase attuale: ${session.phase || "-"}`,
        `Ultimo messaggio cliente: ${sanitizeText(msg?.text || msg?.caption) || "-"}`,
      ].join("\n")
    );
  } catch (error) {
    console.warn(`topic escalation notify warning: ${error.message}`);
  }

  const text = [
    "Operatore collegato.",
    "Da questo momento puoi scrivere qui e l'operatore ti risponde direttamente in questa chat.",
  ].join("\n");
  pushConversationTurn(state, "assistant", text);
  await sendMessage(chatId, text, { reply_markup: buildHomeKeyboard(botConfig) });
  await notifyAdminOperatorRequest(msg, state, reason, `topic:${session.topicThreadId}`);
}

function findCorrectionReply(text, correctionRules) {
  const normalized = sanitizeText(text).toLowerCase();
  if (!normalized || !Array.isArray(correctionRules) || !correctionRules.length) {
    return "";
  }

  let bestRule = null;
  for (const rule of correctionRules) {
    const trigger = sanitizeText(rule?.trigger).toLowerCase();
    const answer = sanitizeText(rule?.answer);
    if (!trigger || !answer) continue;
    if (!normalized.includes(trigger)) continue;

    if (!bestRule || trigger.length > bestRule.trigger.length) {
      bestRule = { trigger, answer };
    }
  }

  return bestRule ? bestRule.answer : "";
}

async function generateAiReply({ userText, state, services, botConfig, conversationContext }) {
  const model = OPENAI_MODEL_OVERRIDE || botConfig.model || "gpt-4o-mini";
  const missing = getMissingLeadFields(state.lead);
  const history = formatHistoryForPrompt(state.history);
  const servicesSummary = buildServicesSummaryForPrompt(services);
  const correctionsSummary = buildCorrectionsSummaryForPrompt(botConfig.correctionRules);
  const detectedContextSummary = buildDetectedContextSummary(conversationContext);

  const systemPrompt = [
    botConfig.systemPrompt,
    "",
    "Regole obbligatorie:",
    "- Rispondi solo in italiano.",
    "- Non usare markdown.",
    "- Non inventare prezzi o servizi.",
    "- Se il cliente chiede assistenza umana o non riesci a risolvere, imposta needs_operator a true.",
    "- Raccogli in modo naturale i campi ordine mancanti: nome, servizio, budget, dettagli, contatto.",
    "- Se ci sono correzioni, applicale in priorita.",
    "",
    "Rispondi SOLO con JSON valido usando questo schema:",
    '{"reply":"string","lead_updates":{"name":"string","service":"string","budget":"string","details":"string","contact":"string"},"needs_operator":false,"ready_for_order":false}',
    "",
    "Catalogo servizi disponibile:",
    servicesSummary || "- Non disponibile",
    "",
    "Correzioni prioritarie:",
    correctionsSummary || "- Nessuna",
    "",
    "Contesto rilevato dal motore intent:",
    detectedContextSummary || "- Nessun contesto forte",
  ].join("\n");

  const userPrompt = [
    `Messaggio cliente: ${sanitizeText(userText)}`,
    `Lead attuale: ${JSON.stringify(state.lead)}`,
    `Campi mancanti: ${missing.length ? missing.join(", ") : "nessuno"}`,
    `Storico recente:\n${history || "nessuno"}`,
  ].join("\n");

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const content = await requestOpenAiChatCompletion({
      model,
      messages,
      useJsonResponseFormat: true,
    });
    const parsed = parseAiJsonPayload(content);
    if (parsed) return parsed;
  } catch (error) {
    if (!isResponseFormatError(error)) {
      console.warn(`openai warning: ${error.message}`);
      return null;
    }
  }

  try {
    const content = await requestOpenAiChatCompletion({
      model,
      messages,
      useJsonResponseFormat: false,
    });
    return parseAiJsonPayload(content);
  } catch (error) {
    console.warn(`openai warning: ${error.message}`);
    return null;
  }
}

async function requestOpenAiChatCompletion({ model, messages, useJsonResponseFormat }) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  const endpoint = `${OPENAI_BASE_URL}/chat/completions`;
  const payload = {
    model,
    messages,
    temperature: 0.3,
  };
  if (useJsonResponseFormat) {
    payload.response_format = { type: "json_object" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let parsed = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const errorText = sanitizeText(parsed?.error?.message || parsed?.message || response.statusText || "OpenAI error");
      throw new Error(`openai failed: ${response.status} ${errorText}`);
    }

    const content = extractChatCompletionContent(parsed);
    if (!content) {
      throw new Error("openai empty content");
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function extractChatCompletionContent(payload) {
  const choice = payload?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && typeof part.text === "string") return part.text;
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function parseAiJsonPayload(rawContent) {
  const text = sanitizeText(rawContent);
  if (!text) return null;

  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      const snippet = text.slice(first, last + 1);
      try {
        parsed = JSON.parse(snippet);
      } catch {
        parsed = null;
      }
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  const leadSource = parsed.lead_updates && typeof parsed.lead_updates === "object" ? parsed.lead_updates : parsed.lead;
  return {
    reply: sanitizeText(parsed.reply || parsed.answer || "").slice(0, 3600),
    leadUpdates: normalizeLeadUpdates(leadSource),
    needsOperator: Boolean(parsed.needs_operator || parsed.handoff || parsed.operator_required),
    readyForOrder: Boolean(parsed.ready_for_order || parsed.save_lead || parsed.order_ready),
  };
}

function normalizeLeadUpdates(source) {
  const payload = source && typeof source === "object" ? source : {};
  return {
    name: sanitizeText(payload.name).slice(0, 80),
    service: sanitizeText(payload.service).slice(0, 140),
    budget: sanitizeText(payload.budget).slice(0, 140),
    details: sanitizeText(payload.details).slice(0, 1600),
    contact: sanitizeText(payload.contact).slice(0, 200),
  };
}

function mergeLead(target, updates) {
  if (!target || !updates) return;
  const keys = ["name", "service", "budget", "details", "contact"];

  for (const key of keys) {
    const currentValue = sanitizeText(target[key]);
    const nextValue = sanitizeText(updates[key]);
    if (!nextValue) continue;
    if (!currentValue || nextValue.length > currentValue.length) {
      target[key] = nextValue;
    }
  }
}

function getMissingLeadFields(lead) {
  const safeLead = lead && typeof lead === "object" ? lead : {};
  const required = [
    { key: "name", label: "nome" },
    { key: "service", label: "servizio" },
    { key: "details", label: "dettagli" },
    { key: "contact", label: "contatto" },
  ];

  return required
    .filter((item) => !sanitizeText(safeLead[item.key]))
    .map((item) => item.label);
}

function isLeadReady(lead) {
  return getMissingLeadFields(lead).length === 0;
}

async function maybePersistLead(chatId, msg, state, botConfig) {
  if (!isLeadReady(state.lead)) return false;

  const signature = [
    sanitizeText(state.lead.name).toLowerCase(),
    sanitizeText(state.lead.service).toLowerCase(),
    sanitizeText(state.lead.details).toLowerCase(),
    sanitizeText(state.lead.contact).toLowerCase(),
    sanitizeText(state.lead.budget).toLowerCase(),
  ].join("|");

  if (!signature || signature === state.lastLeadSignature) {
    return false;
  }

  const lead = {
    id: `lead_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    source: "services-bot-ai",
    chatId: Number(chatId),
    userId: Number(msg.from?.id || 0),
    username: sanitizeText(msg.from?.username),
    firstName: sanitizeText(msg.from?.first_name),
    lastName: sanitizeText(msg.from?.last_name),
    assistantName: sanitizeText(botConfig.assistantName),
    name: sanitizeText(state.lead.name),
    service: sanitizeText(state.lead.service),
    budget: sanitizeText(state.lead.budget),
    details: sanitizeText(state.lead.details),
    contact: sanitizeText(state.lead.contact),
    history: state.history.slice(-12),
  };

  appendLead(lead);
  state.lastLeadSignature = signature;
  state.lastLeadAt = lead.createdAt;
  state.updatedAt = Date.now();

  await notifyAdminLead(lead);
  return true;
}

async function notifyAdminLead(lead) {
  if (!ADMIN_CHAT_ID) return;

  const lines = [
    "Nuova richiesta ordine da Services AI Bot",
    `ID: ${lead.id}`,
    `Nome: ${lead.name || "-"}`,
    `Servizio: ${lead.service || "-"}`,
    `Budget: ${lead.budget || "-"}`,
    `Contatto: ${lead.contact || "-"}`,
    `Utente Telegram: ${lead.username ? `@${lead.username}` : "-"} (ID ${lead.userId || "-"})`,
    `Dettagli: ${lead.details || "-"}`,
  ];

  try {
    await sendMessage(ADMIN_CHAT_ID, lines.join("\n"));
  } catch (error) {
    console.warn(`admin notify warning: ${error.message}`);
  }
}

async function notifyAdminOperatorRequest(msg, state, reason, operatorUrl) {
  if (!ADMIN_CHAT_ID) return;

  const lines = [
    "Richiesta operatore da Services AI Bot",
    `Motivo: ${sanitizeText(reason) || "n/a"}`,
    `Utente: ${sanitizeText(msg?.from?.first_name)} ${sanitizeText(msg?.from?.last_name)} (${msg?.from?.id || "-"})`,
    `Username: ${msg?.from?.username ? `@${msg.from.username}` : "-"}`,
    `Contatto operatore: ${operatorUrl}`,
    `Lead nome: ${sanitizeText(state?.lead?.name) || "-"}`,
    `Lead servizio: ${sanitizeText(state?.lead?.service) || "-"}`,
    `Lead contatto: ${sanitizeText(state?.lead?.contact) || "-"}`,
    `Ultimo messaggio utente: ${sanitizeText(msg?.text || msg?.caption) || "-"}`,
  ];

  try {
    await sendMessage(ADMIN_CHAT_ID, lines.join("\n"));
  } catch (error) {
    console.warn(`admin operator notify warning: ${error.message}`);
  }
}

function buildFallbackReply(userText, lead, services) {
  const text = sanitizeText(userText).toLowerCase();
  if (!text) {
    return "Posso aiutarti con i servizi disponibili e con la richiesta ordine.";
  }

  if (/(prezz|costo|tariff|quanto|listino)/i.test(text)) {
    return buildServicesCatalogMessage(services);
  }

  const missing = getMissingLeadFields(lead);
  if (missing.length) {
    return `Posso aiutarti subito. Per preparare la richiesta mi serve: ${missing.join(", ")}.`;
  }

  return "Perfetto, ho quasi tutto. Vuoi confermare la richiesta o preferisci parlare con un operatore umano?";
}

function buildServicesCatalogMessage(services) {
  if (!Array.isArray(services) || services.length === 0) {
    return "Il listino non e disponibile in questo momento. Puoi comunque descrivermi il tuo progetto.";
  }

  const lines = ["Servizi principali disponibili:"];
  services.slice(0, 12).forEach((item) => {
    const note = item.priceNote ? ` (${item.priceNote})` : "";
    lines.push(`- ${item.title}: ${item.price}${note}`);
  });
  lines.push("");
  lines.push("Scrivimi il servizio che ti interessa e preparo la richiesta.");
  return lines.join("\n");
}

function buildServicesSummaryForPrompt(services) {
  if (!Array.isArray(services) || services.length === 0) return "";
  return services
    .slice(0, 20)
    .map((service) => {
      const notes = service.priceNote ? ` | Nota: ${service.priceNote}` : "";
      const description = service.description ? ` | Desc: ${service.description}` : "";
      const features = Array.isArray(service.features) && service.features.length ? ` | Feature: ${service.features.slice(0, 3).join(", ")}` : "";
      const tiers =
        Array.isArray(service.fintechMetrics) && service.fintechMetrics.length
          ? ` | Tiers: ${service.fintechMetrics.map((item) => `${item.label}=${item.value}`).join(", ")}`
          : "";
      const listHint =
        Array.isArray(service.bankPriceList) && service.bankPriceList.length
          ? ` | Listino: ${service.bankPriceList.slice(0, 6).map((item) => `${item.bank}:${item.price}`).join(", ")}`
          : "";
      return `- ${service.title} | Prezzo: ${service.price}${notes}${description}${features}${tiers}${listHint}`;
    })
    .join("\n");
}

function buildCorrectionsSummaryForPrompt(corrections) {
  if (!Array.isArray(corrections) || corrections.length === 0) return "";
  return corrections
    .slice(0, 40)
    .map((item) => `- Trigger: "${sanitizeText(item?.trigger)}" -> Risposta: "${sanitizeText(item?.answer)}"`)
    .join("\n");
}

function buildDetectedContextSummary(context) {
  const source = context && typeof context === "object" ? context : {};
  const intentLabels = {
    exchange_crypto: "Exchange Crypto",
    exchange_accounts: "Account Exchange",
    banking_accounts: "Conti/Account Bancari",
    programming_bots: "Bot & Automazioni",
    miniapp_web: "Mini App & Sito Web",
    pricing: "Richiesta Prezzi",
  };

  const primary = sanitizeText(source.primaryIntent);
  const intentScores = source.intentScores && typeof source.intentScores === "object" ? source.intentScores : {};
  const serviceCandidates = Array.isArray(source.serviceCandidates) ? source.serviceCandidates : [];
  const queryStyle = sanitizeText(source.queryStyle) || "generic";
  const lines = [];

  if (primary) {
    lines.push(`Intent primario: ${intentLabels[primary] || primary}`);
  }

  const rankedIntents = Object.entries(intentScores)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 4);
  if (rankedIntents.length) {
    lines.push(
      `Intent scores: ${rankedIntents.map(([key, score]) => `${intentLabels[key] || key}=${Number(score || 0).toFixed(1)}`).join(", ")}`
    );
  }

  if (serviceCandidates.length) {
    lines.push(
      `Candidate servizi: ${serviceCandidates
        .slice(0, 3)
        .map((item) => `${sanitizeText(item.title)}(${Number(item.score || 0).toFixed(1)})`)
        .join(", ")}`
    );
  }

  lines.push(`Stile richiesta: ${queryStyle}`);
  return lines.join("\n");
}

function formatHistoryForPrompt(history) {
  if (!Array.isArray(history) || history.length === 0) return "";
  return history
    .slice(-10)
    .map((turn) => `${turn.role === "assistant" ? "Bot" : "Cliente"}: ${sanitizeText(turn.text)}`)
    .join("\n");
}

function extractLeadHintsFromText(text, services) {
  const value = sanitizeText(text);
  if (!value) return {};
  const lower = value.toLowerCase();
  const updates = {};

  const nameMatch = value.match(/\b(?:mi chiamo|sono)\s+([a-zA-Z][a-zA-Z' -]{1,60})/i);
  if (nameMatch?.[1]) {
    updates.name = sanitizeText(nameMatch[1]);
  }

  const contactMatch =
    value.match(/@[a-zA-Z0-9_]{5,32}/) ||
    value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) ||
    value.match(/\+?\d[\d\s-]{6,20}\d/);
  if (contactMatch?.[0]) {
    updates.contact = sanitizeText(contactMatch[0]);
  }

  const budgetMatch = value.match(/(?:\d{2,6}(?:[.,]\d{1,2})?\s*€)|(?:€\s*\d{2,6}(?:[.,]\d{1,2})?)/i);
  if (budgetMatch?.[0]) {
    updates.budget = sanitizeText(budgetMatch[0]).replace(/\s+/g, " ");
  }

  const inferredService = inferServiceFromText(lower, services);
  if (inferredService) {
    updates.service = inferredService;
  }

  if (value.length >= 30 && /(voglio|cerco|serve|necessito|mi serve|progetto|bot|sito|app|exchange|account|banca)/i.test(lower)) {
    updates.details = value;
  }

  return updates;
}

function inferServiceFromText(lowerText, services) {
  if (!lowerText || !Array.isArray(services) || services.length === 0) return "";

  let winner = null;
  for (const service of services) {
    const title = sanitizeText(service?.title);
    if (!title) continue;
    const titleLower = title.toLowerCase();
    if (!titleLower) continue;

    if (lowerText.includes(titleLower)) {
      if (!winner || titleLower.length > winner.matchLength) {
        winner = { value: title, matchLength: titleLower.length };
      }
      continue;
    }

    const tokens = titleLower.split(/\s+/).filter((token) => token.length >= 4);
    const matchedTokens = tokens.filter((token) => lowerText.includes(token)).length;
    if (matchedTokens >= 2 && (!winner || matchedTokens > winner.matchTokens)) {
      winner = { value: title, matchLength: 0, matchTokens: matchedTokens };
    }
  }

  return winner?.value || "";
}

function buildGroundedReply(text, services, lead, conversationContext) {
  const normalized = sanitizeText(text).toLowerCase();
  if (!normalized) return null;

  const context = conversationContext && typeof conversationContext === "object"
    ? conversationContext
    : inferConversationContext(text, { contextProfile: {} }, services);
  const primaryIntent = sanitizeText(context.primaryIntent);
  const serviceMatch = findMatchingServiceBlock(normalized, services, context);
  const exchangeBlock = findCryptoExchangeBlock(services);
  const bankAccountsBlock = findBankAccountsBlock(services);
  const exchangeAccountsBlock = findExchangeAccountsBlock(services);

  if ((primaryIntent === "exchange_crypto" || isExchangeCommissionIntent(normalized)) && exchangeBlock) {
    return {
      reply: buildExchangeCommissionReply(exchangeBlock),
      leadUpdates: {
        service: exchangeBlock.title,
      },
    };
  }

  if ((primaryIntent === "banking_accounts" || isBankListIntent(normalized)) && bankAccountsBlock) {
    return {
      reply: buildBankPriceListReply(bankAccountsBlock),
      leadUpdates: {
        service: bankAccountsBlock.title,
      },
    };
  }

  if ((primaryIntent === "exchange_accounts" || isExchangeAccountListIntent(normalized)) && exchangeAccountsBlock) {
    return {
      reply: buildBankPriceListReply(exchangeAccountsBlock),
      leadUpdates: {
        service: exchangeAccountsBlock.title,
      },
    };
  }

  if (context.queryStyle === "list" && primaryIntent) {
    const intentServices = findServicesByIntent(services, primaryIntent);
    if (intentServices.length > 1) {
      return {
        reply: buildIntentCatalogReply(primaryIntent, intentServices),
        leadUpdates: {
          service: sanitizeText(lead?.service),
        },
      };
    }
  }

  if (serviceMatch) {
    const closeCandidates = Array.isArray(context.serviceCandidates) ? context.serviceCandidates.slice(0, 2) : [];
    if (
      context.queryStyle === "generic" &&
      closeCandidates.length === 2 &&
      Math.abs(Number(closeCandidates[0].score || 0) - Number(closeCandidates[1].score || 0)) <= 4
    ) {
      return {
        reply: buildClarificationForCandidates(closeCandidates),
        leadUpdates: {
          service: sanitizeText(lead?.service),
        },
      };
    }

    return {
      reply: buildServiceDetailsReply(serviceMatch),
      leadUpdates: {
        service: serviceMatch.title,
      },
    };
  }

  if (isGenericPriceIntent(normalized) || context.queryStyle === "pricing") {
    return {
      reply: buildServicesCatalogMessage(services),
      leadUpdates: {
        service: sanitizeText(lead?.service),
      },
    };
  }

  return null;
}

function inferConversationContext(text, state, services) {
  const normalized = sanitizeText(text).toLowerCase();
  const intentScores = detectIntentScores(normalized);
  const prevScores = state?.contextProfile?.intentScores && typeof state.contextProfile.intentScores === "object"
    ? state.contextProfile.intentScores
    : {};

  for (const [intent, score] of Object.entries(prevScores)) {
    const previous = Number(score || 0);
    if (previous <= 0) continue;
    intentScores[intent] = Number(intentScores[intent] || 0) + previous * 0.35;
  }

  const queryStyle = detectQueryStyle(normalized);
  const serviceCandidates = rankServiceCandidates(normalized, services, intentScores).slice(0, 4);
  const primaryIntent = detectPrimaryIntent(intentScores, state?.contextProfile?.lastPrimaryIntent);

  return {
    primaryIntent,
    intentScores,
    queryStyle,
    serviceCandidates,
  };
}

function updateConversationContextProfile(state, context) {
  if (!state || typeof state !== "object") return;
  const current = state.contextProfile && typeof state.contextProfile === "object" ? state.contextProfile : {};
  const incomingScores = context?.intentScores && typeof context.intentScores === "object" ? context.intentScores : {};
  const nextScores = {};

  for (const [intent, score] of Object.entries(incomingScores)) {
    const normalizedScore = Number(score || 0);
    if (normalizedScore <= 0) continue;
    nextScores[intent] = Number(normalizedScore.toFixed(2));
  }

  state.contextProfile = {
    lastPrimaryIntent: sanitizeText(context?.primaryIntent) || sanitizeText(current.lastPrimaryIntent),
    intentScores: nextScores,
    lastServiceCandidates: Array.isArray(context?.serviceCandidates)
      ? context.serviceCandidates.slice(0, 4).map((item) => ({ id: item.id, title: item.title, score: item.score }))
      : Array.isArray(current.lastServiceCandidates)
        ? current.lastServiceCandidates
        : [],
    lastQueryStyle: sanitizeText(context?.queryStyle) || sanitizeText(current.lastQueryStyle) || "generic",
  };
}

function findMatchingServiceBlock(normalizedText, services, context) {
  const ranked = rankServiceCandidates(
    normalizedText,
    services,
    context?.intentScores && typeof context.intentScores === "object" ? context.intentScores : {}
  );
  if (!ranked.length) return null;
  const winner = ranked[0];
  return Number(winner.score || 0) >= 12 ? winner : null;
}

function rankServiceCandidates(normalizedText, services, intentScores = {}) {
  if (!normalizedText || !Array.isArray(services)) return [];
  const rows = [];

  for (const service of services) {
    const title = sanitizeText(service?.title);
    if (!title) continue;
    const titleLower = title.toLowerCase();
    let score = 0;

    if (normalizedText.includes(titleLower)) {
      score += 50 + titleLower.length;
    }

    const keywords = collectServiceKeywords(service);
    let matchedTokens = 0;
    for (const keyword of keywords) {
      if (keyword.length < 4) continue;
      if (normalizedText.includes(keyword)) {
        score += keyword.length;
        matchedTokens += 1;
      }
    }
    score += matchedTokens * 2;

    const serviceIntents = Array.isArray(SERVICE_INTENT_HINTS[service.id]) ? SERVICE_INTENT_HINTS[service.id] : [];
    for (const intent of serviceIntents) {
      score += Number(intentScores[intent] || 0) * 7;
    }

    if (score <= 0) continue;
    rows.push({
      ...service,
      score: Number(score.toFixed(2)),
    });
  }

  rows.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  return rows;
}

function detectIntentScores(normalizedText) {
  const scores = {};
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORD_SETS)) {
    let score = 0;
    for (const keyword of keywords) {
      const probe = sanitizeText(keyword).toLowerCase();
      if (!probe) continue;
      if (!normalizedText.includes(probe)) continue;
      score += probe.includes(" ") ? 2.2 : 1.1;
      if (probe === normalizedText) {
        score += 4;
      }
    }
    if (score > 0) {
      scores[intent] = Number(score.toFixed(2));
    }
  }
  return scores;
}

function detectPrimaryIntent(intentScores, fallbackIntent = "") {
  let winnerIntent = "";
  let winnerScore = 0;
  for (const [intent, value] of Object.entries(intentScores || {})) {
    const score = Number(value || 0);
    if (score <= winnerScore) continue;
    winnerScore = score;
    winnerIntent = intent;
  }

  if (winnerIntent && winnerScore >= 1.0) {
    return winnerIntent;
  }
  return sanitizeText(fallbackIntent);
}

function detectQueryStyle(normalizedText) {
  const listWords = ["lista", "elenco", "tutti", "tutte", "quali", "available", "disponibili", "catalogo"];
  const pricingWords = ["prezz", "costo", "tariff", "quanto", "listino", "commissioni", "fee", "percent"];
  const detailWords = ["come funziona", "dettagli", "spiega", "parlami", "info", "informazioni"];

  if (listWords.some((item) => normalizedText.includes(item))) return "list";
  if (pricingWords.some((item) => normalizedText.includes(item))) return "pricing";
  if (detailWords.some((item) => normalizedText.includes(item))) return "detail";
  return "generic";
}

function findServicesByIntent(services, intent) {
  if (!Array.isArray(services) || !intent) return [];
  return services.filter((service) => {
    const hints = Array.isArray(SERVICE_INTENT_HINTS[service.id]) ? SERVICE_INTENT_HINTS[service.id] : [];
    return hints.includes(intent);
  });
}

function buildIntentCatalogReply(intent, services) {
  const titleByIntent = {
    exchange_crypto: "Servizi Exchange Crypto",
    exchange_accounts: "Account Exchange disponibili",
    banking_accounts: "Account bancari e wallet disponibili",
    programming_bots: "Servizi Bot e Automazioni",
    miniapp_web: "Servizi Mini App e Sito Web",
  };
  const heading = titleByIntent[intent] || "Servizi disponibili";
  const lines = [heading];
  services.slice(0, 10).forEach((service) => {
    const note = service.priceNote ? ` (${service.priceNote})` : "";
    lines.push(`- ${service.title}: ${service.price}${note}`);
  });
  lines.push("Scrivimi quale opzione preferisci e ti preparo subito la proposta.");
  return lines.join("\n");
}

function buildClarificationForCandidates(candidates) {
  const list = Array.isArray(candidates) ? candidates : [];
  if (!list.length) return "";
  const lines = ["Per darti una risposta precisa, intendi uno di questi servizi?"];
  list.slice(0, 3).forEach((item) => {
    lines.push(`- ${sanitizeText(item.title)}`);
  });
  lines.push("Scrivimi il nome esatto e ti invio dettagli e prezzo corretti.");
  return lines.join("\n");
}

function collectServiceKeywords(service) {
  const pieces = [sanitizeText(service?.title), sanitizeText(service?.category), sanitizeText(service?.id)];
  const tokens = pieces
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u017f]+/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return Array.from(new Set(tokens)).slice(0, 24);
}

function findCryptoExchangeBlock(services) {
  return services.find((service) => {
    const haystack = [service.id, service.category, service.title].map((item) => sanitizeText(item).toLowerCase()).join(" ");
    return haystack.includes("exchange") && haystack.includes("crypto");
  });
}

function findBankAccountsBlock(services) {
  return services.find((service) => {
    const haystack = [service.id, service.category, service.title].map((item) => sanitizeText(item).toLowerCase()).join(" ");
    return haystack.includes("account banc") || haystack.includes("banca") || haystack.includes("wallet");
  });
}

function findExchangeAccountsBlock(services) {
  return services.find((service) => {
    const haystack = [service.id, service.category, service.title].map((item) => sanitizeText(item).toLowerCase()).join(" ");
    return haystack.includes("account exchange");
  });
}

function isExchangeCommissionIntent(text) {
  const triggers = ["commission", "exchange crypto", "fascia", "percent", "commissioni", "fee exchange"];
  return triggers.some((trigger) => text.includes(trigger));
}

function isBankListIntent(text) {
  const triggers = ["banche", "banca", "conto", "account banc", "wallet", "iban"];
  return triggers.some((trigger) => text.includes(trigger));
}

function isExchangeAccountListIntent(text) {
  const triggers = ["account exchange", "binance", "coinbase", "kraken", "kucoin", "bybit", "bitget", "wirex"];
  return triggers.some((trigger) => text.includes(trigger));
}

function isGenericPriceIntent(text) {
  const triggers = ["prezz", "costo", "tariff", "listino", "quanto", "servizi disponibili"];
  return triggers.some((trigger) => text.includes(trigger));
}

function buildServiceDetailsReply(service) {
  const lines = [];
  const category = sanitizeText(service.category);
  if (category) {
    lines.push(`${category} - ${service.title}`);
  } else {
    lines.push(service.title);
  }

  if (service.description) {
    lines.push(service.description);
  }

  let priceLine = service.price ? `Prezzo: ${service.price}` : "";
  if (service.priceNote) {
    priceLine = priceLine ? `${priceLine} (${service.priceNote})` : service.priceNote;
  }
  if (priceLine) {
    lines.push(priceLine);
  }

  if (Array.isArray(service.features) && service.features.length) {
    lines.push("Funzionalita principali:");
    service.features.slice(0, 5).forEach((feature) => lines.push(`- ${feature}`));
  }

  return lines.join("\n");
}

function buildExchangeCommissionReply(service) {
  const lines = [service.title || "Exchange Crypto"];
  if (service.priceNote) {
    lines.push(service.priceNote);
  }

  if (Array.isArray(service.fintechMetrics) && service.fintechMetrics.length) {
    lines.push("Commissioni applicate:");
    service.fintechMetrics.forEach((metric) => {
      lines.push(`- ${metric.label}: ${metric.value}`);
    });
  } else if (service.price) {
    lines.push(`Condizioni: ${service.price}`);
  }

  lines.push("Se vuoi, preparo subito una richiesta personalizzata.");
  return lines.join("\n");
}

function buildBankPriceListReply(service) {
  const lines = [service.title || "Listino account"];
  if (service.price) {
    lines.push(`Base: ${service.price}`);
  }
  if (service.priceNote) {
    lines.push(service.priceNote);
  }

  const entries = Array.isArray(service.bankPriceList) ? service.bankPriceList : [];
  if (entries.length) {
    lines.push("Disponibilita principali:");
    entries.slice(0, 24).forEach((entry) => {
      lines.push(`- ${entry.bank}: ${entry.price}`);
    });
    if (entries.length > 24) {
      lines.push(`... e altri ${entries.length - 24} provider disponibili su richiesta.`);
    }
  }

  lines.push("Indicami il provider che preferisci e ti confermo subito i dettagli operativi.");
  return lines.join("\n");
}

function getServiceBlocks(normalizedData) {
  const normalized = normalizedData || loadNormalizedData();
  const blocks = Array.isArray(normalized?.servicesPage?.serviceBlocks) ? normalized.servicesPage.serviceBlocks : [];

  return blocks
    .map((block) => ({
      id: sanitizeText(block?.id),
      category: sanitizeText(block?.category),
      title: sanitizeText(block?.title),
      description: sanitizeText(block?.description),
      price: sanitizeText(block?.price),
      priceNote: sanitizeText(block?.priceNote),
      features: Array.isArray(block?.features) ? block.features.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 10) : [],
      fintechMetrics: Array.isArray(block?.fintechMetrics)
        ? block.fintechMetrics
            .map((item) => ({
              label: sanitizeText(item?.label),
              value: sanitizeText(item?.value),
            }))
            .filter((item) => item.label && item.value)
            .slice(0, 12)
        : [],
      bankPriceList: Array.isArray(block?.bankPriceList)
        ? block.bankPriceList
            .map((item) => ({
              bank: sanitizeText(item?.bank || item?.name),
              price: sanitizeText(item?.price || item?.value),
            }))
            .filter((item) => item.bank && item.price)
            .slice(0, 80)
        : [],
    }))
    .filter((block) => block.title && block.price)
    .slice(0, 60);
}

function getServicesBotConfig(normalizedData) {
  const defaults = normalizeServicesBotConfig(dataStore.getDefaultData?.().servicesBot || {});
  const normalized = normalizedData || loadNormalizedData();
  const fromData = normalizeServicesBotConfig(normalized?.servicesBot || {});

  const merged = {
    enabled: typeof fromData.enabled === "boolean" ? fromData.enabled : defaults.enabled,
    assistantName: fromData.assistantName || defaults.assistantName,
    model: fromData.model || defaults.model,
    systemPrompt: fromData.systemPrompt || defaults.systemPrompt,
    operatorLabel: fromData.operatorLabel || defaults.operatorLabel,
    operatorUrl: fromData.operatorUrl || defaults.operatorUrl,
    operatorFallbackMessage: fromData.operatorFallbackMessage || defaults.operatorFallbackMessage,
    handoffKeywords: fromData.handoffKeywords.length ? fromData.handoffKeywords : defaults.handoffKeywords,
    correctionRules: fromData.correctionRules,
  };

  if (!merged.operatorUrl) {
    merged.operatorUrl = CONTACT_LINK || SERVICES_PAGE_URL;
  }

  return merged;
}

function normalizeServicesBotConfig(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const handoffKeywords = Array.isArray(source.handoffKeywords)
    ? source.handoffKeywords
        .map((item) => sanitizeText(item).toLowerCase())
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const correctionRules = Array.isArray(source.correctionRules)
    ? source.correctionRules
        .map((item, index) => {
          const trigger = sanitizeText(item?.trigger || item?.question || item?.pattern).toLowerCase();
          const answer = sanitizeText(item?.answer || item?.response || item?.output);
          if (!trigger || !answer) return null;
          return {
            id: sanitizeText(item?.id) || `rule-${index + 1}`,
            trigger,
            answer,
          };
        })
        .filter(Boolean)
        .slice(0, 80)
    : [];

  return {
    enabled: typeof source.enabled === "boolean" ? source.enabled : true,
    assistantName: sanitizeText(source.assistantName) || "Consulente YOSUPPORT AI",
    model: sanitizeText(source.model) || "gpt-4o-mini",
    systemPrompt:
      sanitizeText(source.systemPrompt) ||
      "Sei il consulente commerciale ufficiale YOSUPPORT. Rispondi in italiano in modo professionale e raccogli i dati ordine.",
    operatorLabel: sanitizeText(source.operatorLabel) || "Parla con operatore",
    operatorUrl: sanitizeText(source.operatorUrl) || "",
    operatorFallbackMessage:
      sanitizeText(source.operatorFallbackMessage) ||
      "Se preferisci supporto umano immediato, puoi contattare direttamente un operatore tramite il link dedicato.",
    handoffKeywords: handoffKeywords.length
      ? handoffKeywords
      : ["operatore", "supporto umano", "assistenza umana", "parlare con umano", "manager"],
    correctionRules,
  };
}

function loadNormalizedData() {
  const defaults = typeof dataStore.getDefaultData === "function" ? dataStore.getDefaultData() : {};
  if (!fs.existsSync(SITE_DATA_FILE)) {
    return normalizeData(defaults);
  }

  try {
    const raw = fs.readFileSync(SITE_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeData(parsed);
  } catch {
    return normalizeData(defaults);
  }
}

function normalizeData(payload) {
  if (typeof dataStore.normalizeData === "function") {
    return dataStore.normalizeData(payload);
  }
  return payload && typeof payload === "object" ? payload : {};
}

function appendLead(lead) {
  ensureDataDirectory();

  const all = loadLeads();
  all.push(lead);
  const tempFile = `${LEADS_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(all, null, 2), "utf8");
  fs.renameSync(tempFile, LEADS_FILE);
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    const raw = fs.readFileSync(LEADS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function sendMessage(chatId, text, extra = {}) {
  const normalized = sanitizeText(text) || "Messaggio non disponibile.";
  const maxLength = 3900;
  const safeText = normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;

  await telegramApi("sendMessage", {
    chat_id: chatId,
    text: safeText,
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
  const value = sanitizeText(text);
  if (!value.startsWith("/")) return "";
  const firstToken = value.split(/\s+/)[0].trim();
  const command = firstToken.split("@")[0].toLowerCase();
  if (!BOT_USERNAME) return command;

  const mentionPart = firstToken.includes("@") ? firstToken.split("@")[1].toLowerCase() : "";
  if (mentionPart && mentionPart !== BOT_USERNAME.toLowerCase()) {
    return "";
  }
  return command;
}

function extractIncomingText(msg) {
  if (!msg || typeof msg !== "object") return "";
  return sanitizeText(msg.text || msg.caption || "");
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

function resolveServicesPageUrl() {
  const explicit = normalizeUrl(process.env.SERVICES_PAGE_URL);
  if (explicit) return explicit;

  const webApp = normalizeUrl(process.env.WEBAPP_URL);
  if (!webApp) return "";
  try {
    return new URL("/services", webApp).toString();
  } catch {
    return "";
  }
}

function resolveContactLink() {
  const telegramSupport = String(process.env.SERVICES_CONTACT_TELEGRAM || "").trim().replace(/^@/, "");
  if (telegramSupport) {
    return `https://t.me/${telegramSupport}`;
  }
  return SERVICES_PAGE_URL || "https://t.me";
}

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

function normalizeOpenAiBaseUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "https://api.openai.com/v1";
  return normalized.replace(/\/+$/, "");
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWebhookPath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "/telegram/services-webhook";
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

function isResponseFormatError(error) {
  const text = sanitizeText(error?.message).toLowerCase();
  if (!text) return false;
  return text.includes("response_format") || text.includes("json_object");
}

function runSelfTest() {
  const normalized = loadNormalizedData();
  const services = getServiceBlocks(normalized);
  const checks = [
    "Quanto costa il bot per moderazione chat?",
    "Mi servono le commissioni exchange crypto",
    "Avete lista banche disponibili e prezzi?",
    "Quali account exchange avete tipo Binance e Bybit?",
    "Parlami della mini app telegram + sito web",
    "Fammi vedere il listino servizi",
    "Mi interessa un bot avanzato con menu",
    "Cerco conti disponibili con prezzi",
    "Vorrei mini app + sito web con gestione da bot",
  ];

  console.log("=== SERVICES BOT SELFTEST ===");
  console.log(`Services loaded: ${services.length}`);
  for (const query of checks) {
    const result = buildGroundedReply(query, services, {});
    const output = sanitizeText(result?.reply || buildFallbackReply(query, {}, services));
    console.log("");
    console.log(`Q: ${query}`);
    console.log(`A: ${output.slice(0, 520)}`);
  }
  console.log("=== END SELFTEST ===");
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
  console.log("Stopping services bot...");

  if (webhookServer) {
    webhookServer.close(() => process.exit(0));
    return;
  }

  process.exit(0);
}
