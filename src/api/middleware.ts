import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import {
  BadRequestError,
  UserNotAuthenticatedError,
  UserForbiddenError,
  NotFoundError
} from "./errors.js";

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
  config.api.fileserverHits++;
  next();
}

export function middlewareError(err: Error, _: Request, res: Response, __: NextFunction) {
  if (err instanceof BadRequestError) {
    res.status(400).json({
      "error": err.message
    });
  } else if (err instanceof UserNotAuthenticatedError) {
    res.status(401).json({
      "error": err.message
    });
  } else if (err instanceof UserForbiddenError) {
    res.status(403).json({
      "error": err.message
    });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({
      "error": err.message
    });
  } else {
    console.log(err.message);
    res.status(500).json({
      "error": "Something went wrong on our end"
    });
  }
}
