const crypto = require("crypto");

const password = process.argv[2];
const login = String(process.argv[3] || "admin").trim() || "admin";
if (!password) {
  console.error('Usage: node scripts/generate-admin-hash.js "YourStrongPassword" [login]');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");

console.log(`RI_ADMIN_LOGIN=${login}`);
console.log(`RI_ADMIN_PASSWORD_SALT=${salt}`);
console.log(`RI_ADMIN_PASSWORD_HASH=${hash}`);
