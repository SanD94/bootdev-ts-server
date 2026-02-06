import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type Config = {
  api: APIConfig;
  db: DBConfig;
};

type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
};

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: Number(requireKey("PORT")),
    platform: requireKey("PLATFORM"),
  },
  db: {
    migrationConfig: migrationConfig,
    url: requireKey("DB_URL"),
  },
};

export enum Platform {
  Dev = "dev",
  Prod = "prod",
};

function requireKey(key: string): string {
  const val = process.env[key];
  if (val === undefined) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return val;
}
