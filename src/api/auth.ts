import { Response, Request } from "express";
import { getUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { isUser } from "./users.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { config } from "../config.js";
import {
  saveRefreshToken,
  findUserByActiveRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh.js";


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

  const accessToken = makeJWT(signedUser.id, config.jwt.defaultDuration, config.jwt.secret);

  const refreshToken = makeRefreshToken();

  const isSaved = await saveRefreshToken(signedUser.id, refreshToken);
  if (!isSaved) {
    throw new UserNotAuthenticatedError("401 Refresh Token Unavailable");
  }

  res.status(200).send({
    ...signedUser,
    token: accessToken,
    refreshToken: refreshToken,
  });

};

export async function handlerRefresh(req: Request, res: Response) {
  let refreshToken = getBearerToken(req);

  const result = await findUserByActiveRefreshToken(refreshToken);
  if (!result) {
    throw new UserNotAuthenticatedError("Invalid Refresh Token");
  }

  const { user } = result;
  res.status(200).send({
    token: makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret),
  });
}

export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);

  res.status(204).send();
}
