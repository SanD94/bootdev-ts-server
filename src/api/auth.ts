import { Response, Request } from "express";
import { getUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { isUser } from "./users.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  const user = req.body;


  if (!isUser(user)) {
    throw new BadRequestError("Something went wrong");
  }

  let duration = user?.expiresInSecond;

  if (!duration || duration > config.jwt.defaultDuration) {
    duration = config.jwt.defaultDuration;
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

  const token = makeJWT(signedUser.id, duration, config.jwt.secret);

  res.status(200).send({
    ...signedUser,
    token,
  });

};

