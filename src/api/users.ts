import { Response, Request } from "express";
import { BadRequestError } from "./errors.js";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";


function isNewUser(obj: any): obj is NewUser {
  return typeof obj?.email === "string";
}

export async function handlerCreateUser(req: Request, res: Response) {
  const user = req.body;

  if (!isNewUser(user)) {
    throw new BadRequestError("Something went wrong");
  }

  const newUser = await createUser(user);

  res.status(201).send(newUser);
}
