import {type JwtPayload } from 'jsonwebtoken'

export interface Payload extends JwtPayload {
  user: { name: string; email: string }
}