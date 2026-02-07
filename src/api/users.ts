import { Response, Request } from "express";
import { BadRequestError } from "./errors.js";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { hashPassword } from "../auth.js";


type CreateUser = Pick<NewUser, "email"> & {
  password: string;
};

function isNewUser(obj: any): obj is CreateUser {
  return typeof obj?.email === "string"
    && typeof obj?.password === "string";
}

export async function handlerCreateUser(req: Request, res: Response) {
  const user = req.body;

  if (!isNewUser(user)) {
    throw new BadRequestError("Something went wrong");
  }

  const { hashedPassword, ...newUser } = await createUser({
    email: user.email,
    hashedPassword: await hashPassword(user.email),
  });

  res.status(201).send(newUser);
}
