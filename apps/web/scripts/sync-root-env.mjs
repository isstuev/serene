import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootEnvPath = resolve(__dirname, "../../../.env");
const webEnvPath = resolve(__dirname, "../.env");
const webEnvLocalPath = resolve(__dirname, "../.env.local");

if (!existsSync(rootEnvPath)) {
  const isManagedBuild =
    process.env.CI === "true" ||
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";

  if (isManagedBuild) {
    console.log(
      "[env-sync] Root .env not found; skipping file sync and using injected environment variables.",
    );
    process.exit(0);
  }

  console.warn("[env-sync] Missing root .env file at", rootEnvPath);
  console.warn("[env-sync] Skipping file sync. Scripts will use current process environment.");
  console.warn("[env-sync] For local development, create it from .env.example.");
  process.exit(0);
}

copyFileSync(rootEnvPath, webEnvPath);
copyFileSync(rootEnvPath, webEnvLocalPath);
console.log("[env-sync] Synced root .env -> apps/web/.env and apps/web/.env.local");
