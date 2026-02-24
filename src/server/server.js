const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataStore = require("../shared/data-store.js");

const APP_ROOT = path.resolve(__dirname, "..", "..");
const WEB_ROOT = path.join(APP_ROOT, "src", "web");
const SHARED_ROOT = path.join(APP_ROOT, "src", "shared");
loadEnvFile(path.join(APP_ROOT, ".env"));

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);

const DATA_DIR = path.join(APP_ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "site-data.json");
const AUTH_FILE = path.join(DATA_DIR, "admin-auth.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const SESSION_COOKIE = "ri_admin_sid";
const CSRF_COOKIE = "ri_admin_csrf";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
const SESSION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_ATTEMPTS = 7;
const RATE_LOCK_MS = 20 * 60 * 1000;

const BODY_LIMIT_BYTES = 1_000_000;
const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
const UPLOAD_BODY_LIMIT_BYTES = Math.ceil(UPLOAD_MAX_BYTES * 1.45);
const UPLOAD_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const UPLOAD_MIME_EXTENSION = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const DEFAULT_DATA =
  typeof dataStore.getDefaultData === "function" ? dataStore.getDefaultData() : { serviceLabels: {}, regions: [] };
const normalizeInputData =
  typeof dataStore.normalizeData === "function" ? dataStore.normalizeData : (payload) => payload;

const sessions = new Map();
const loginAttempts = new Map();

const ADMIN_AUTH = loadAdminAuthConfig();
let currentData = loadDataFromDisk();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = requestUrl.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApiRequest(req, res, pathname);
      return;
    }

    await handleStaticRequest(req, res, pathname);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    const message = statusCode >= 500 ? "Errore interno del server." : String(error?.message || "Richiesta non valida.");
    sendJson(res, statusCode, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Ristoranti d'Italia server running on http://${HOST}:${PORT}`);
});

setInterval(cleanExpiredSessions, SESSION_CLEANUP_INTERVAL_MS).unref();

function loadAdminAuthConfig() {
  ensureDataDirectory();

  const envLogin = String(process.env.RI_ADMIN_LOGIN || "").trim();
  const envSalt = String(process.env.RI_ADMIN_PASSWORD_SALT || "").trim();
  const envHash = String(process.env.RI_ADMIN_PASSWORD_HASH || "").trim().toLowerCase();
  const envPassword = String(process.env.RI_ADMIN_PASSWORD || "").trim();

  if (envPassword) {
    console.warn("RI_ADMIN_PASSWORD is ignored for security. Use RI_ADMIN_PASSWORD_SALT and RI_ADMIN_PASSWORD_HASH.");
  }

  if (envSalt && isHex(envHash)) {
    return {
      login: envLogin || "admin",
      salt: envSalt,
      hash: envHash,
      source: "env-hash",
    };
  }

  if (envSalt || envHash) {
    console.warn("Invalid admin env credentials. Falling back to data/admin-auth.json.");
  }

  if (fs.existsSync(AUTH_FILE)) {
    try {
      const raw = fs.readFileSync(AUTH_FILE, "utf8");
      const parsed = JSON.parse(raw);
      const login = String(parsed?.login || "").trim() || "admin";
      const salt = String(parsed?.salt || "").trim();
      const hash = String(parsed?.hash || "").trim().toLowerCase();
      if (salt && isHex(hash)) {
        return {
          login,
          salt,
          hash,
          source: "file",
        };
      }
    } catch {
      // Ignore invalid file and regenerate credentials below.
    }
  }

  const generatedPassword = generateStrongPassword();
  const generatedLogin = envLogin || "admin";
  const generatedSalt = randomToken(16);
  const generatedHash = hashPassword(generatedPassword, generatedSalt);
  const authPayload = {
    login: generatedLogin,
    salt: generatedSalt,
    hash: generatedHash,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(authPayload, null, 2), "utf8");

  console.log("Generated admin credentials:");
  console.log(`  login: ${generatedLogin}`);
  console.log(`  password: ${generatedPassword}`);
  console.log(`Saved in: ${AUTH_FILE}`);

  return {
    login: generatedLogin,
    salt: generatedSalt,
    hash: generatedHash,
    source: "generated",
  };
}

function loadDataFromDisk() {
  ensureDataDirectory();

  if (!fs.existsSync(DATA_FILE)) {
    const baseline = normalizeInputData(DEFAULT_DATA);
    saveDataToDisk(baseline);
    return baseline;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeInputData(parsed);
  } catch {
    const fallback = normalizeInputData(DEFAULT_DATA);
    saveDataToDisk(fallback);
    return fallback;
  }
}

function saveDataToDisk(nextData) {
  ensureDataDirectory();
  const normalized = normalizeInputData(nextData);
  const payload = JSON.stringify(normalized, null, 2);
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, payload, "utf8");
  fs.renameSync(tempFile, DATA_FILE);
  return normalized;
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

async function handleApiRequest(req, res, pathname) {
  const method = (req.method || "GET").toUpperCase();

  if (pathname === "/api/health" && method === "GET") {
    sendJson(res, 200, { ok: true, timestamp: new Date().toISOString() });
    return;
  }

  if (pathname === "/api/public-data" && method === "GET") {
    const publicData = normalizeInputData(currentData);
    sendJson(res, 200, { data: publicData });
    return;
  }

  if (pathname === "/api/admin/session" && method === "GET") {
    const session = getSessionFromRequest(req);
    if (!session) {
      sendJson(res, 200, { authenticated: false });
      return;
    }

    sendJson(res, 200, {
      authenticated: true,
      login: session.login,
      expiresAt: session.expiresAt,
      csrfToken: session.csrfToken,
    });
    return;
  }

  if (pathname === "/api/admin/login" && method === "POST") {
    if (!isSameOrigin(req)) {
      sendJson(res, 403, { error: "Origine non valida." });
      return;
    }

    const ip = getRequestIp(req);
    const limitState = validateLoginRateLimit(ip);
    if (!limitState.allowed) {
      sendJson(
        res,
        429,
        { error: `Troppi tentativi. Riprova tra ${Math.max(1, limitState.retryAfterSeconds)}s.` },
        {
          "Retry-After": String(Math.max(1, limitState.retryAfterSeconds)),
        }
      );
      return;
    }

    const body = await readJsonBody(req);
    const login = String(body?.login || "").trim();
    const password = String(body?.password || "");

    if (!verifyLogin(login) || !verifyPassword(password)) {
      registerLoginFailure(ip);
      sendJson(res, 401, { error: "Credenziali non valide." });
      return;
    }

    clearLoginFailures(ip);
    const session = createSession(req);
    sendJson(
      res,
      200,
      {
        authenticated: true,
        csrfToken: session.csrfToken,
      },
      {
        "Set-Cookie": buildSessionCookies(session, req),
      }
    );
    return;
  }

  if (pathname === "/api/admin/logout" && method === "POST") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    if (!validateCsrf(req, session)) {
      sendJson(res, 403, { error: "CSRF token non valido." });
      return;
    }

    sessions.delete(session.id);
    sendJson(
      res,
      200,
      { ok: true },
      {
        "Set-Cookie": clearSessionCookies(req),
      }
    );
    return;
  }

  if (pathname === "/api/admin/data" && method === "GET") {
    const session = requireAdminSession(req, res);
    if (!session) return;

    sendJson(res, 200, {
      data: normalizeInputData(currentData),
      csrfToken: session.csrfToken,
    });
    return;
  }

  if (pathname === "/api/admin/data" && method === "PUT") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    if (!validateCsrf(req, session)) {
      sendJson(res, 403, { error: "CSRF token non valido." });
      return;
    }

    const body = await readJsonBody(req);
    const nextPayload = body?.data;
    if (!nextPayload || typeof nextPayload !== "object") {
      sendJson(res, 400, { error: "Payload non valido." });
      return;
    }

    const normalized = normalizeInputData(nextPayload);
    currentData = saveDataToDisk(normalized);

    sendJson(res, 200, {
      ok: true,
      data: normalizeInputData(currentData),
      csrfToken: session.csrfToken,
    });
    return;
  }

  if (pathname === "/api/admin/reset" && method === "POST") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    if (!validateCsrf(req, session)) {
      sendJson(res, 403, { error: "CSRF token non valido." });
      return;
    }

    currentData = saveDataToDisk(DEFAULT_DATA);
    sendJson(res, 200, {
      ok: true,
      data: normalizeInputData(currentData),
      csrfToken: session.csrfToken,
    });
    return;
  }

  if (pathname === "/api/admin/upload-media" && method === "POST") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    if (!validateCsrf(req, session)) {
      sendJson(res, 403, { error: "CSRF token non valido." });
      return;
    }

    const body = await readJsonBody(req, UPLOAD_BODY_LIMIT_BYTES);
    const uploaded = saveUploadedMedia(body);
    sendJson(res, 200, {
      ok: true,
      url: uploaded.url,
      mediaType: uploaded.mediaType,
      fileName: uploaded.fileName,
      bytes: uploaded.bytes,
      csrfToken: session.csrfToken,
    });
    return;
  }

  sendJson(res, 404, { error: "Endpoint non trovato." });
}

async function handleStaticRequest(req, res, pathname) {
  const method = (req.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    sendJson(res, 405, { error: "Metodo non consentito." });
    return;
  }

  let relativePath = pathname;
  if (relativePath === "/") {
    relativePath = "/index.html";
  }
  if (relativePath === "/admin" || relativePath === "/admin/") {
    relativePath = "/admin.html";
  }

  const decoded = safeDecodePath(relativePath);
  if (!decoded) {
    sendJson(res, 400, { error: "Percorso non valido." });
    return;
  }

  const cleanPath = decoded.startsWith("/") ? decoded : `/${decoded}`;
  let sourceRoot = WEB_ROOT;
  let relativeSafePath = cleanPath;
  if (cleanPath.startsWith("/shared/")) {
    sourceRoot = SHARED_ROOT;
    relativeSafePath = cleanPath.slice("/shared".length);
  } else if (cleanPath.startsWith("/uploads/")) {
    sourceRoot = UPLOADS_DIR;
    relativeSafePath = cleanPath.slice("/uploads".length);
  }

  const absolutePath = path.resolve(sourceRoot, `.${relativeSafePath}`);
  if (!isPathInside(sourceRoot, absolutePath)) {
    sendJson(res, 403, { error: "Accesso negato." });
    return;
  }

  let filePath = absolutePath;
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    // If stat fails we will return 404 below.
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    sendJson(res, 404, { error: "Risorsa non trovata." });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
  };

  if (filePath.endsWith(".html")) {
    headers["Cache-Control"] = "no-store";
  } else {
    headers["Cache-Control"] = "public, max-age=300";
  }

  if (method === "HEAD") {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  res.writeHead(200, headers);
  stream.pipe(res);
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    ...extraHeaders,
  };

  const body = JSON.stringify(payload);
  res.writeHead(statusCode, headers);
  res.end(body);
}

function requireAdminSession(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    sendJson(res, 401, { error: "Non autorizzato." });
    return null;
  }
  return session;
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;

  const session = sessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return session;
}

function createSession(req) {
  const id = randomToken(48);
  const csrfToken = randomToken(32);
  const now = Date.now();
  const session = {
    id,
    login: ADMIN_AUTH.login,
    csrfToken,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    ip: getRequestIp(req),
    userAgent: String(req.headers["user-agent"] || ""),
  };

  sessions.set(id, session);
  return session;
}

function buildSessionCookies(session, req) {
  const secureFlag = isRequestSecure(req) ? "; Secure" : "";
  const sessionCookie = `${SESSION_COOKIE}=${encodeURIComponent(session.id)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secureFlag}`;
  const csrfCookie = `${CSRF_COOKIE}=${encodeURIComponent(session.csrfToken)}; Path=/; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secureFlag}`;
  return [sessionCookie, csrfCookie];
}

function clearSessionCookies(req) {
  const secureFlag = isRequestSecure(req) ? "; Secure" : "";
  const sessionCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag}`;
  const csrfCookie = `${CSRF_COOKIE}=; Path=/; SameSite=Strict; Max-Age=0${secureFlag}`;
  return [sessionCookie, csrfCookie];
}

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

function validateCsrf(req, session) {
  const headerToken = String(req.headers["x-csrf-token"] || "");
  if (!headerToken) return false;
  return timingSafeEqualString(headerToken, session.csrfToken);
}

function validateLoginRateLimit(ip) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.lockUntil > now) {
    const retryAfterSeconds = Math.ceil((current.lockUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  if (now - current.firstAttemptAt > RATE_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

function registerLoginFailure(ip) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || now - current.firstAttemptAt > RATE_WINDOW_MS) {
    loginAttempts.set(ip, {
      firstAttemptAt: now,
      attempts: 1,
      lockUntil: 0,
    });
    return;
  }

  current.attempts += 1;
  if (current.attempts >= RATE_MAX_ATTEMPTS) {
    current.lockUntil = now + RATE_LOCK_MS;
  }
  loginAttempts.set(ip, current);
}

function clearLoginFailures(ip) {
  loginAttempts.delete(ip);
}

function verifyLogin(login) {
  return timingSafeEqualString(String(login || "").trim(), ADMIN_AUTH.login);
}

function verifyPassword(password) {
  const candidateHash = hashPassword(String(password || ""), ADMIN_AUTH.salt);
  return timingSafeEqualHex(candidateHash, ADMIN_AUTH.hash);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a), "utf8");
  const right = Buffer.from(String(b), "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function timingSafeEqualHex(a, b) {
  if (!isHex(a) || !isHex(b)) return false;
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function isHex(value) {
  return typeof value === "string" && /^[a-f0-9]+$/i.test(value);
}

function randomToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

function generateStrongPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = crypto.randomBytes(18);
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function parseCookies(cookieHeader) {
  const entries = String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const result = {};
  for (const entry of entries) {
    const index = entry.indexOf("=");
    if (index < 0) continue;
    const key = entry.slice(0, index).trim();
    const value = entry.slice(index + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}

function getRequestIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  if (forwarded) return forwarded;
  return String(req.socket?.remoteAddress || "unknown");
}

function isSameOrigin(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return true;

  const host = String(req.headers.host || "").trim();
  if (!host) return false;

  const expected = `${isRequestSecure(req) ? "https" : "http"}://${host}`;
  return origin === expected;
}

function isRequestSecure(req) {
  if (req.socket?.encrypted) return true;
  const protoHeader = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  return protoHeader === "https";
}

function saveUploadedMedia(payload) {
  const mimeType = String(payload?.mimeType || "")
    .trim()
    .toLowerCase();
  const fileNameInput = sanitizeFileName(payload?.fileName);
  const rawBase64 = String(payload?.base64 || "").trim();

  if (!mimeType || !UPLOAD_ALLOWED_MIME_TYPES.has(mimeType)) {
    throw createHttpError(400, "Tipo media non supportato.");
  }

  if (!rawBase64) {
    throw createHttpError(400, "Payload media mancante.");
  }

  const normalizedBase64 = rawBase64.includes(",") ? rawBase64.split(",").pop().trim() : rawBase64;
  if (!/^[A-Za-z0-9+/=]+$/.test(normalizedBase64)) {
    throw createHttpError(400, "Media base64 non valido.");
  }

  const buffer = Buffer.from(normalizedBase64, "base64");
  if (!buffer.length) {
    throw createHttpError(400, "Media vuoto.");
  }
  if (buffer.length > UPLOAD_MAX_BYTES) {
    throw createHttpError(413, `File troppo grande. Massimo ${Math.floor(UPLOAD_MAX_BYTES / (1024 * 1024))}MB.`);
  }

  ensureDataDirectory();

  const extension = resolveUploadExtension(mimeType, fileNameInput);
  const storageName = `${Date.now()}-${randomToken(10)}${extension}`;
  const finalPath = path.join(UPLOADS_DIR, storageName);
  if (!isPathInside(UPLOADS_DIR, finalPath)) {
    throw createHttpError(400, "Percorso upload non valido.");
  }

  const tempPath = `${finalPath}.tmp`;
  fs.writeFileSync(tempPath, buffer);
  fs.renameSync(tempPath, finalPath);

  return {
    url: `/uploads/${encodeURIComponent(storageName)}`,
    mediaType: getMediaTypeFromMime(mimeType),
    fileName: storageName,
    bytes: buffer.length,
  };
}

function sanitizeFileName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "upload";
  return raw.replace(/[^\w.-]+/g, "_").slice(0, 120);
}

function resolveUploadExtension(mimeType, originalName) {
  const byMime = UPLOAD_MIME_EXTENSION[mimeType];
  if (byMime) return byMime;

  const ext = path.extname(String(originalName || "")).toLowerCase();
  if (ext && MIME_TYPES[ext]) return ext;
  return ".bin";
}

function getMediaTypeFromMime(mimeType) {
  if (mimeType === "image/gif") return "gif";
  if (mimeType.startsWith("video/")) return "video";
  return "photo";
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;

  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }

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

async function readJsonBody(req, limitBytes = BODY_LIMIT_BYTES) {
  const chunks = [];
  let totalLength = 0;

  for await (const chunk of req) {
    totalLength += chunk.length;
    if (totalLength > limitBytes) {
      const error = new Error("Body troppo grande.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("JSON non valido.");
    error.statusCode = 400;
    throw error;
  }
}

function safeDecodePath(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return "";
  }
}

function isPathInside(baseDir, targetPath) {
  const normalizedBase = path.resolve(baseDir);
  const normalizedTarget = path.resolve(targetPath);
  if (normalizedBase === normalizedTarget) return true;
  return normalizedTarget.startsWith(`${normalizedBase}${path.sep}`);
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
