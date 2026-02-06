import { Request, Response } from "express";
import { config, Platform } from "../config.js";
import { reset } from "../db/queries/users.js";
import { UserForbiddenError } from "./errors.js";

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
  if (config.api.platform !== Platform.Dev) {
    console.log(config.api.platform);
    throw new UserForbiddenError("Reset is only allowed in dev environment");
  }

  config.api.fileserverHits = 0;
  await reset();

  res.write("Hits reset to 0");
  res.end();
}

