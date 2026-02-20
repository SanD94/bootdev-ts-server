import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getChirps() {
  const rows = await db
    .select()
    .from(chirps)
    .orderBy(chirps.createdAt);
  return rows;
}

export async function getChirpsByAuthorId(authorId: string) {
  const rows = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, authorId))
    .orderBy(chirps.createdAt);
  return rows;
}

export async function getChirp(chirpId: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId));
  return result;
}

export async function deleteChirp(chirpId: string) {
  const rows = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();
  return rows.length > 0;
}


