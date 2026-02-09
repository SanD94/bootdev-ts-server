import * as argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/errors.js";
import { tryAction } from "./utils.js";

const TOKEN_ISSUER = "chirpy";

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
    iss: TOKEN_ISSUER,
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
