import { Response, Request } from "express";
import {
  BadRequestError,
  ChirpTooLongError,
  NotFoundError,
  UserForbiddenError,
} from "./errors.js";
import {
  createChirp,
  getChirps,
  getChirp,
  deleteChirp,
} from "../db/queries/chirps.js";
import { NewChirp } from "../db/schema.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";


type Chirp = Pick<NewChirp, "body">;

function isChirp(obj: any): obj is Chirp {
  return typeof obj?.body === "string";
}

function getValidChirp(chirp: any): Chirp {
  const maxChirpLength = 140;
  const slangs = ["kerfuffle", "sharbert", "fornax"];

  if (!isChirp(chirp)) {
    throw new BadRequestError("Something went wrong");
  }

  if (chirp.body.length > maxChirpLength) {
    throw new ChirpTooLongError(`Chirp is too long. Max length is ${maxChirpLength}`);
  }

  const chirpWords: string[] = chirp.body.split(" ");

  for (let i = 0; i < chirpWords.length; i++) {
    if (slangs.includes(chirpWords[i].toLowerCase())) {
      chirpWords[i] = "****";
    }
  }

  return {
    "body": chirpWords.join(" "),
  };
}



export async function handlerCreateChirp(req: Request, res: Response) {
  const chirp = getValidChirp(req.body);
  const token = getBearerToken(req);
  const jwtUserId = validateJWT(token, config.jwt.secret);


  const newChirp = await createChirp({
    ...chirp,
    userId: jwtUserId,
  });

  res.status(201).send(newChirp);
}

export async function handlerGetChirps(req: Request, res: Response) {
  const { authorId, sort } = req.query;
  const chirps = await getChirps({
    authorId: typeof authorId === "string" ? authorId : undefined,
    sort: sort === "desc" ? "desc" : "asc",
  });

  res.send(chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
  const { chirpId } = req.params;
  const chirp = await getChirp(chirpId as string);

  if (!chirp) {
    throw new NotFoundError(`chirp with id: ${chirpId} not found`);
  }

  res.send(chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const { chirpId } = req.params;
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const chirp = await getChirp(chirpId as string);

  if (!chirp) {
    throw new NotFoundError(`chirp with id: ${chirpId} not found`);
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("Not Authorized");
  }

  await deleteChirp(chirp.id);

  res.status(204).send();
}
