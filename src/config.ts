process.loadEnvFile();

type APIConfig = {
  fileserverHits: number;
  dbURL: string;
};

export const config: APIConfig = {
  fileserverHits: 0,
  dbURL: requireKey("DB_URL"),
};


function requireKey(key: string): string {
  const val = process.env[key];
  if (val === undefined) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return val;
}
