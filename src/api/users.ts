import { Response, Request } from "express";
import { BadRequestError } from "./errors.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";


export type User = Pick<NewUser, "email"> & {
  password: string;
};


export function isUser(obj: any): obj is User {
  return typeof obj?.email === "string"
    && typeof obj?.password === "string";
}

export async function handlerCreateUser(req: Request, res: Response) {
  const user = req.body;

  if (!isUser(user)) {
    throw new BadRequestError("Something went wrong");
  }

  const { hashedPassword, ...newUser } = await createUser({
    email: user.email,
    hashedPassword: await hashPassword(user.password),
  });

  res.status(201).send(newUser);
}


export async function handlerUpdateUser(req: Request, res: Response) {
  const user = req.body;
  const token = getBearerToken(req);

  if (!isUser(user)) {
    throw new BadRequestError("Something went wrong");
  }

  const id = validateJWT(token, config.jwt.secret);

  const { hashedPassword, ...updatedUser } = await updateUser(id, {
    email: user.email,
    hashedPassword: await hashPassword(user.password),
  });

  res.status(200).send(updatedUser);

}
