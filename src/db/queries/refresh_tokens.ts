import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return result;
}

export async function revokeRefreshToken(token: string, date: Date) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: date })
    .where(eq(refreshTokens.token, token));
}

export async function reset() {
  await db.delete(refreshTokens);
}
