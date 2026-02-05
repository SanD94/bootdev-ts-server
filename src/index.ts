import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import express from "express";

import { handlerReadiness } from "./api/readiness.js";
import { middlewareError, middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics, handlerResetMetrics } from "./api/metrics.js";
import { handlerChirpValidation } from "./api/chirp_validation.js";

import { config } from "./config.js";
import { handlerCreateUser } from "./api/user.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app/"));

// api endpoints
app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerChirpValidation(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});

// admin endpoints
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerResetMetrics);

app.use(middlewareError);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});


