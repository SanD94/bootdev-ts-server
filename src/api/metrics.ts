import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response): Promise<void> {
  res.set("Content-Type", "text/html; charset=utf-8");
  const content = `
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>
`;

  res.send(content);
}

export async function handlerResetMetrics(_: Request, res: Response): Promise<void> {
  config.api.fileserverHits = 0;
  res.write("Server Count is Reset");
  res.end();
}

