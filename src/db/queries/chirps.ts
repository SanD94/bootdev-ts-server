import { eq, asc, desc } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

interface GetChirpsOptions {
  authorId?: string;
  sort?: "asc" | "desc";
}

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getChirps({ authorId, sort = "asc" }: GetChirpsOptions = {}) {
  const orderFn = sort === "desc" ? desc : asc;

  return db
    .select()
    .from(chirps)
    .where(authorId ? eq(chirps.userId, authorId) : undefined)
    .orderBy(orderFn(chirps.createdAt));
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


