import { Response, Request } from "express";
import { getUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { isUser } from "./users.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  const user = req.body;
  const HOUR = 3600;


  if (!isUser(user)) {
    throw new BadRequestError("Something went wrong");
  }

  if (!user?.expiresInSecond || user.expiresInSecond > HOUR) {
    user.expiresInSecond = HOUR;
  }

  const currentUser = await getUser(user.email);

  if (!currentUser) {
    throw new UserNotAuthenticatedError("401 Unauthorized");
  }

  const { hashedPassword, ...signedUser } = currentUser;

  const loginSuccess = await checkPasswordHash(user.password, hashedPassword);

  if (!loginSuccess) {
    throw new UserNotAuthenticatedError("401 Unauthorized");
  }

  const token = makeJWT(signedUser.id, user.expiresInSecond, config.api.secret);

  res.status(200).send({
    ...signedUser,
    token,
  });

};

