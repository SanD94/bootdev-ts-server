import { Response, Request } from "express";

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
    throw new Error("Something went wrong");
  }
  if (chirp.body.length > maxChirpLength) {
    throw new Error("Chirp is too long");
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
