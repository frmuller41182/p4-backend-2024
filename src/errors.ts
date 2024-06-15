import type { ErrorRequestHandler, RequestHandler } from "express";
import { send } from "./response";
import type { ZodError } from "zod";

const zodErrorMessage = (err: ZodError): string => {
  const [firstIssue] = err.issues;
  const { code, path } = firstIssue;
  switch (code) {
    case "too_small": {
      return `${path}is too small`;
    }
    default: {
      return `Input data is wrong`;
    }
  }
};

export const defaultErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  switch (err.name) {
    case "NotFoundError": {
      return send(res).notFound();
    }
    case "ZodError": {
      return send(res).badRequest(zodErrorMessage(err));
    }
    default: {
      console.log(err);
      return send(res).internalServerError(`Internal Error.`);
    }
  }
};

export const catchErrors =
  (myHandler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await myHandler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
