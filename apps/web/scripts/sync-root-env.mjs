import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootEnvPath = resolve(__dirname, "../../../.env");
const webEnvPath = resolve(__dirname, "../.env");
const webEnvLocalPath = resolve(__dirname, "../.env.local");

if (!existsSync(rootEnvPath)) {
  console.error("[env-sync] Missing root .env file at", rootEnvPath);
  console.error("[env-sync] Create it from .env.example before running scripts.");
  process.exit(1);
}

copyFileSync(rootEnvPath, webEnvPath);
copyFileSync(rootEnvPath, webEnvLocalPath);
console.log("[env-sync] Synced root .env -> apps/web/.env and apps/web/.env.local");
