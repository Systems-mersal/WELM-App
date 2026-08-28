import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../.env"),
];

const envPath = candidates.find((candidate) => fs.existsSync(candidate));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[payments-server] Missing required env var "${name}". Copy server/.env.example to server/.env and fill it in.`,
    );
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
};

if (!env.stripeSecretKey.startsWith("sk_")) {
  throw new Error(
    '[payments-server] STRIPE_SECRET_KEY must start with "sk_" (use a Stripe secret key, never a publishable key).',
  );
}

if (env.stripeSecretKey.includes("REPLACE_ME") || env.stripeSecretKey.length < 20) {
  throw new Error(
    "[payments-server] STRIPE_SECRET_KEY is still the placeholder. Open server/.env and paste your real sk_test_… key from https://dashboard.stripe.com/apikeys",
  );
}
