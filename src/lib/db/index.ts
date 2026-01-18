import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use a placeholder during build if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder";

// Only throw error at runtime if trying to use db without proper config
const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export type Database = typeof db;

// Helper to check if database is properly configured
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
