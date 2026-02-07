import * as argon2 from "argon2";

export async function hashPassword(password: string) {
  const hashedPassword = await argon2.hash(password);

  return hashedPassword;
}

export async function checkPasswordHash(password: string, hash: string) {
  const matched = await argon2.verify(hash, password);

  return matched;
}
