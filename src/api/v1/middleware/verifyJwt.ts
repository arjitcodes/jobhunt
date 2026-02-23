
import jwt from 'jsonwebtoken'
import express from 'express'
import { type Payload } from '../interface/token.js'

export const verifyJwt = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' })
  const token: string | undefined = authHeader?.split(' ')[1]

  if(!token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    const decoded = jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`) as Payload
    req.payload = decoded
    return next()
  } catch (error) {
    return res.status(403).json({ msg: 'Invalid token', error })
  }
}