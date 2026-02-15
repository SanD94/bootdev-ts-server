import { Request } from "express";
import * as argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/errors.js";
import { tryAction } from "./utils.js";
import { config } from "./config.js";
import crypto from "crypto";

const BEAR_TOKEN = "Bearer";

export async function hashPassword(password: string) {
  const hashedPassword = await argon2.hash(password);

  return hashedPassword;
}

export async function checkPasswordHash(password: string, hash: string) {
  const matched = await argon2.verify(hash, password);

  return matched;
}

type payload = Required<Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">>;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const iat = Math.floor(Date.now() / 1000);

  const payload: payload = {
    iss: config.jwt.issuer,
    sub: userID,
    iat: iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  const [decoded, err] = tryAction(() => jwt.verify(tokenString, secret) as payload);

  if (err || !decoded) {
    throw new UserNotAuthenticatedError(err?.message ?? "Invalid Token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader || typeof authHeader !== "string") {
    throw new UserNotAuthenticatedError("Token not available");
  }

  const [bearer, token, ...extra] = authHeader.split(" ");

  if (bearer !== BEAR_TOKEN || !token || extra.length > 0) {
    throw new UserNotAuthenticatedError("Authorization header is broken");
  }

  return token;
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}
