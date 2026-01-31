import express from "express";

import { handlerReadiness } from "./api/readiness";

const PORT = 8080;
const app = express();

app.use("/app", express.static("./src/app/"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


