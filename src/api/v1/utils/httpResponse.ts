import {type Request,type Response } from 'express'
import {type tHttpResponse } from '../interface/http.js'

import Config from './../../../config/index.js'
import { EApplicationEnvironment } from '../../../constant/index.js'

export default (req: Request, res: Response, responseStatusCode: number, responseMessage: string, data: unknown = null) => {
  const response: tHttpResponse = {
    success: true,
    statusCode: responseStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl
    },
    message: responseMessage,
    data: data
  }


  //production environment check
  if (Config.ENV === EApplicationEnvironment.PRODUCTION) {
    delete response.request.ip
  }
  res.status(responseStatusCode).json(response)
}