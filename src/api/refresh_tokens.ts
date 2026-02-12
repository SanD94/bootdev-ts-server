import { Request, Response } from "express";
import { UserNotAuthenticatedError } from "./errors.js";
import { getUserFromRefreshToken } from "../db/queries/refresh_tokens.js";
import { config } from "../config.js";
import { makeJWT } from "../auth.js";

const BEAR_TOKEN = "Bearer";


export async function handlerRefreshToken(req: Request, res: Response) {
  const authHeader = req.get("Authorization");
  if (!authHeader || typeof authHeader !== "string") {
    throw new UserNotAuthenticatedError("Token not available");
  }

  const [bearer, token, ...extra] = authHeader.split(" ");

  if (bearer !== BEAR_TOKEN || !token || extra.length > 0) {
    throw new UserNotAuthenticatedError("Authorization header is broken");
  }

  const refreshToken = await getUserFromRefreshToken(token);
  const curDate = new Date();

  if (!refreshToken || refreshToken.expiresAt < curDate || refreshToken.revokedAt) {
    throw new UserNotAuthenticatedError("Refresh Token not available");
  }

  res.status(200).send({
    token: makeJWT(refreshToken.userId, config.jwt.defaultDuration, config.jwt.secret),
  });
}

