import express from "express";

import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics, handlerResetMetrics } from "./api/metrics.js";
import { handlerChirpValidation } from "./api/chirp_validation.js";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app/"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerChirpValidation);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerResetMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


