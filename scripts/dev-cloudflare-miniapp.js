const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
loadEnvFile(path.join(PROJECT_ROOT, ".env"));

const PORT = Number(process.env.PORT || 3000);
const HAS_BOT_TOKEN = Boolean(String(process.env.TELEGRAM_BOT_TOKEN || "").trim());
const CLOUD_FLARE_ARGS = ["tunnel", "--url", `http://127.0.0.1:${PORT}`, "--no-autoupdate"];

let serverProc = null;
let tunnelProc = null;
let botProc = null;
let tunnelUrl = "";
let shuttingDown = false;

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();

function start() {
  console.log(`Starting local site: http://127.0.0.1:${PORT}`);
  serverProc = spawn(process.execPath, ["src/server/server.js"], {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: "inherit",
  });
  serverProc.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`server.js exited with code ${code}`);
      shutdown();
    }
  });

  console.log("Starting Cloudflare Tunnel...");
  tunnelProc = spawn("cloudflared", CLOUD_FLARE_ARGS, {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  wireTunnelStream(tunnelProc.stdout);
  wireTunnelStream(tunnelProc.stderr);

  tunnelProc.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`cloudflared exited with code ${code}`);
      shutdown();
    }
  });
}

function wireTunnelStream(stream) {
  let buffer = "";
  stream.on("data", (chunk) => {
    const text = String(chunk || "");
    process.stdout.write(text);
    buffer += text;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      parseTunnelLine(line);
    }
  });
}

function parseTunnelLine(line) {
  if (!line) return;
  const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (!match) return;

  const nextUrl = match[0].trim();
  if (!nextUrl || nextUrl === tunnelUrl) return;

  tunnelUrl = nextUrl;
  console.log(`\nCloudflare URL: ${tunnelUrl}`);
  console.log("Share this URL with developers for Mini App testing.");

  if (!HAS_BOT_TOKEN) {
    console.log("TELEGRAM_BOT_TOKEN not set, bot is not started.");
    return;
  }

  startOrRestartBot(tunnelUrl);
}

function startOrRestartBot(publicUrl) {
  if (botProc) {
    console.log("Restarting bot with new tunnel URL...");
    botProc.kill("SIGTERM");
    botProc = null;
  } else {
    console.log("Starting bot...");
  }

  const botEnv = {
    ...process.env,
    WEBAPP_URL: publicUrl,
    TELEGRAM_BOT_MODE: "polling",
  };

  botProc = spawn(process.execPath, ["src/bot/bot.js"], {
    cwd: PROJECT_ROOT,
    env: botEnv,
    stdio: "inherit",
  });

  botProc.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`bot.js exited with code ${code}`);
    }
  });
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Shutting down tunnel + site + bot...");

  if (botProc && !botProc.killed) {
    botProc.kill("SIGTERM");
  }
  if (tunnelProc && !tunnelProc.killed) {
    tunnelProc.kill("SIGTERM");
  }
  if (serverProc && !serverProc.killed) {
    serverProc.kill("SIGTERM");
  }

  setTimeout(() => process.exit(0), 180);
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
