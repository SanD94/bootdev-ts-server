import argon2 from "argon2";

export async function hashPassword(password: string) {
  const hashed_password = await argon2.hash(password);

  return hashed_password;
}

export async function checkPasswordHash(password: string, hash: string) {
  const matched = await argon2.verify(hash, password);

  return matched;
}
