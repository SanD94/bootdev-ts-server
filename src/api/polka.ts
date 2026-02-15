import { Response, Request } from "express";

import { upgradeUser } from "../db/queries/users.js";
import { NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

export async function handlerUpgradeUser(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: {
      userId: string;
    }
  };

  const webhook: parameters = req.body;
  const apiKey = getAPIKey(req);

  if (apiKey !== config.api.polkaKey) {
    throw new UserNotAuthenticatedError("Please provide the correct key");
  }

  if (webhook.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const user = await upgradeUser(webhook.data.userId);

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  res.status(204).send();
}
