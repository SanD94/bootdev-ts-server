import express from "express";

import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics, handlerResetMetrics } from "./api/metrics.js";

const PORT = 8080;
const app = express();

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app/"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerResetMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


