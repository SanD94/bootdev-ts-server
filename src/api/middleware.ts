import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const { statusCode } = res;
    if (!(200 <= statusCode && statusCode <= 299)) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
}

export function middlewareMetricsInc(_: Request, __: Response, next: NextFunction) {
  config.fileserverHits++;
  next();
}
