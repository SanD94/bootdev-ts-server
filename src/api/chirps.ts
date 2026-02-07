import { Response, Request } from "express";
import { BadRequestError, ChirpTooLongError, NotFoundError } from "./errors.js";
import { createChirp, getChirps, getChirp } from "../db/queries/chirps.js";
import { NewChirp } from "../db/schema.js";



function isChirp(obj: any): obj is NewChirp {
  return typeof obj?.body === "string"
    && typeof obj?.userId === "string";
}

function getValidChirp(chirp: any): NewChirp {
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
    "userId": chirp.userId,
  };
}



export async function handlerCreateChirp(req: Request, res: Response) {
  const chirp = getValidChirp(req.body);

  const newChirp = await createChirp(chirp);

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
