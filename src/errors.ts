import type { ErrorRequestHandler } from "express";
import { send } from "./response";

export const defaultErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  switch (err.name) {
    default: {
      return send(res).internalServerError(`Internal Error.`);
    }
  }
};
