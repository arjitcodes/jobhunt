import express from 'express'
import {type Payload } from './token.js'
import 'multer'

declare module 'express' {
  interface Request {
    payload?: Payload
  }
}

export interface CustomRequest<T = undefined> extends express.Request {
  body: T extends undefined ? never : T
  cookies: Record<string, string>
  file?: Express.Multer.File | undefined; 
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
}