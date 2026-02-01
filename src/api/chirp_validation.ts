import { Response, Request } from "express";

type Chirp = {
  body: string;
};

function isChirp(obj: any): obj is Chirp {
  return typeof obj?.body === "string";
}

export async function handlerChirpValidation(req: Request, res: Response) {

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const chirp = JSON.parse(body);
      const maxChirpLength = 140;

      if (!isChirp(chirp)) {
        throw new Error("Something went wrong");
      }

      if (chirp.body.length > maxChirpLength) {
        throw new Error("Chirp is too long");
      }

      res.status(200).send({
        valid: true,
      });

    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send({
          error: error.message
        });
      }
    }
  });
}
