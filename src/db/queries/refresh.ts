import { and, eq, isNull, gt } from "drizzle-orm";
import { db } from "../index.js";
import { users, refreshTokens } from "../schema.js";
import { config } from "../../config.js";
import { NotFoundError } from "../../api/errors.js";

export async function saveRefreshToken(userID: string, token: string) {
  const rows = await db
    .insert(refreshTokens)
    .values({
      userId: userID,
      token: token,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
      revokedAt: null,
    })
    .returning();
  return rows.length > 0;
}

export async function findUserByActiveRefreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function revokeRefreshToken(token: string) {
  const rows = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (rows.length === 0) {
    throw new NotFoundError("Couldn't revoke the token, not available");
  }
}

export async function reset() {
  await db.delete(refreshTokens);
}
