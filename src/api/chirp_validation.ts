import { Response, Request } from "express";
import { BadRequestError, ChirpTooLongError } from "./errors.js";

type Chirp = {
  body: string;
};

function isChirp(obj: any): obj is Chirp {
  return typeof obj?.body === "string";
}

export async function handlerChirpValidation(req: Request, res: Response) {
  const chirp = req.body;

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

  res.status(200).send({
    cleanedBody: chirpWords.join(" "),
  });

}
