import jwt from 'jsonwebtoken'
import Config from '../../../config/index.js';

export const createTokens = (name: string, email: string): { accessToken: string; refreshToken: string } => {
  try {
    const accessToken = jwt.sign({ user: { name, email } }, `${Config.ACCESS_TOKEN_SECRET}`, { expiresIn: '1d' })

    const refreshToken = jwt.sign({ user: { name, email } }, `${Config.REFRESH_TOKEN_SECRET}`, { expiresIn: '30d' })

    return { accessToken, refreshToken }
  } catch (error) {
    console.log(error)
    throw error
  }
}