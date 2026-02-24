import type { NextFunction, Request, Response } from "express";
import { type tHttpError } from "../interface/http.js";

export interface IMulterError extends Error {
  name: "MulterError";
  code:
    | "LIMIT_PART_COUNT"
    | "LIMIT_FILE_SIZE"
    | "LIMIT_FILE_COUNT"
    | "LIMIT_FIELD_KEY"
    | "LIMIT_FIELD_VALUE"
    | "LIMIT_FIELD_COUNT"
    | "LIMIT_UNEXPECTED_FILE";
  field?: string;
  storageErrors?: any[];
}

export const globalErrorHandler = (
  err: tHttpError | IMulterError,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  let statusCode = (err as tHttpError).statusCode || 500;
  let message = err.message || "Internal Server Error";

  if ("name" in err && err.name === "MulterError") {
    statusCode = 413;
    if ("code" in err && err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Max limit is 5MB.";
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
