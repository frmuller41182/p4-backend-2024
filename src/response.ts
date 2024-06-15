import type { Response as ExpressResponse } from "express";

enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}

export const send = (res: ExpressResponse) => {
  return {
    ok: (data: any) => {
      res.status(HttpStatus.OK).json(data);
    },
    created: (data: any) => {
      res.status(HttpStatus.CREATED).send(data);
    },
    badRequest: (message: string) => {
      res.status(HttpStatus.BAD_REQUEST).json({ error: message });
    },
    notFound: () => {
      res.status(HttpStatus.NOT_FOUND).send(`Not found.`);
    },
    internalServerError: (message: string) => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: message });
    },
    notImplemented: () => {
      res.status(HttpStatus.NOT_IMPLEMENTED).json({ error: "Not implemented" });
    },
  };
};
