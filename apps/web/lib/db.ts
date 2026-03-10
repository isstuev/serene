import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";

const connectionString = process.env.DATABASE_URL!;

// Serverless functions can fan out quickly; keep one DB connection per runtime
// instance to avoid exhausting Supabase pooler limits.
const client = postgres(connectionString, {
  // Required for Supabase poolers / pgbouncer modes.
  prepare: false,
  // postgres.js default is higher; 1 is safest for serverless environments.
  max: 1,
});

export const db = drizzle(client, { schema });
