import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response): Promise<void> {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${config.fileserverHits}`);
}

export async function handlerResetMetrics(_: Request, res: Response): Promise<void> {
  config.fileserverHits = 0;
  res.write("Server Count is Reset");
  res.end();
}

