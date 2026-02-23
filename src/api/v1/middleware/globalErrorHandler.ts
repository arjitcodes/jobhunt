import type { NextFunction, Request, Response } from "express";
import { type tHttpError } from "../interface/http.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (
  err: tHttpError,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  res.status(err.statusCode).json(err);
};
