import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
}

type APIConfig = {
  fileserverHits: number;
  db: DBConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: APIConfig = {
  fileserverHits: 0,
  db: {
    migrationConfig: migrationConfig,
    url: requireKey("DB_URL"),
  },
};

function requireKey(key: string): string {
  const val = process.env[key];
  if (val === undefined) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return val;
}
