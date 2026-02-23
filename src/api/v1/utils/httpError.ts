import { type NextFunction, type Request } from 'express'
import errorObject from './errorObject.js'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const httpError = (next: NextFunction, err: Error | unknown, req: Request, errorStatusCode: number = 500): void => {
  const errorObj = errorObject(err, req, errorStatusCode)
  return next(errorObj)
}