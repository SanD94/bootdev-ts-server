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

export function middlewareError(err: Error, _: Request, res: Response, __: NextFunction) {
  console.log(err.message);
  res.status(500).json({
    "error": "Something went wrong on our end"
  });
}
