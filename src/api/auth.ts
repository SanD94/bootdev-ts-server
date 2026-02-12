import { Response, Request } from "express";
import { getUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { isUser } from "./users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../auth.js";
import { config } from "../config.js";
import { createRefreshToken } from "../db/queries/refresh_tokens.js";
import { NewRefreshToken } from "../db/schema.js";


export async function handlerLogin(req: Request, res: Response) {
  const user = req.body;


  if (!isUser(user)) {
    throw new BadRequestError("Something went wrong");
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

  const token = makeJWT(signedUser.id, config.jwt.defaultDuration, config.jwt.secret);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 60);
  const refreshToken = await createRefreshToken({
    token: makeRefreshToken(),
    userId: signedUser.id,
    expiresAt: expiryDate,
  } satisfies NewRefreshToken);

  res.status(200).send({
    ...signedUser,
    token,
    refreshToken: refreshToken.token,
  });

};

