import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
};

type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
};

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: Platform;
  polkaKey: string;
};

type JWTConfig = {
  defaultDuration: number;
  refreshDuration: number;
  secret: string;
  issuer: string;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: Number(requireKey("PORT")),
    platform: requireKey("PLATFORM") as Platform,
    polkaKey: requireKey("POLKA_KEY"),
  },
  db: {
    migrationConfig: migrationConfig,
    url: requireKey("DB_URL"),
  },
  jwt: {
    defaultDuration: 60 * 60, // 1 hour in seconds
    refreshDuration: 60 * 60 * 24 * 60 * 1000,  // 60 days in milliseconds
    secret: requireKey("JWT_SECRET"),
    issuer: "chirpy",
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
