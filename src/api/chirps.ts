import { Response, Request } from "express";
import { BadRequestError, ChirpTooLongError, NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { createChirp, getChirps, getChirp } from "../db/queries/chirps.js";
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
  const jwtUserId = validateJWT(token, config.api.secret);


  const newChirp = await createChirp({
    ...chirp,
    userId: jwtUserId,
  });

  res.status(201).send(newChirp);
}

export async function handlerGetChirps(_: Request, res: Response) {
  const chirps = await getChirps();

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
