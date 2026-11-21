import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Generates a cryptographically strong production .env file from .env.example
 * with fresh random secrets (APP_ENCRYPTION_KEY_HEX, AUTH_SECRET, EINVOICE_ENGINE_SHARED_SECRET).
 * Single-node SQLite MVP: no Postgres password is generated. Usage: pnpm env:init
 */
const root = process.cwd();
const envExamplePath = path.join(root, ".env.example");
const envPath = path.join(root, ".env");

if (fs.existsSync(envPath)) {
  console.log(".env already exists — skipping to avoid overwriting your live secrets.");
  process.exit(0);
}

let content = fs.readFileSync(envExamplePath, "utf8");
const encKey = crypto.randomBytes(32).toString("hex");
const authSecret = crypto.randomBytes(32).toString("base64url");
const engineSecret = crypto.randomBytes(24).toString("hex");

content = content
  .replace("change_me_internal_engine_secret", engineSecret)
  .replace("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", encKey)
  .replace("change_me_auth_secret_at_least_32_chars", authSecret);

content += `\n# Your purchased production domain (used by Caddy + health checks)\nAPP_DOMAIN=norminvoice.eu\n`;

fs.writeFileSync(envPath, content, "utf8");
console.log("Created production-ready .env with cryptographically random secrets.");
