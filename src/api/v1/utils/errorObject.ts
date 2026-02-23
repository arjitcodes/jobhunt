import { type Request } from "express";
import { type tHttpError } from "../interface/http.js";
import {
  EApplicationEnvironment,
  responseMessage,
} from "./../../../constant/index.js";
import Config from "../../../config/index.js";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (
  err: Error | unknown,
  req: Request,
  errorStatusCode: number = 500,
): tHttpError => {
  const errorObject: tHttpError = {
    success: false,
    statusCode: errorStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl,
    },
    message:
      err instanceof Error
        ? err.message || responseMessage.SOMETHING_WENT_WRONG
        : responseMessage.SOMETHING_WENT_WRONG,
    data: null,
    trace: err instanceof Error ? { error: err.stack } : null,
  };

  //production environment check
  if (Config.ENV === EApplicationEnvironment.PRODUCTION) {
    delete errorObject.request.ip;
    delete errorObject.trace;
  }

  return errorObject;
};
