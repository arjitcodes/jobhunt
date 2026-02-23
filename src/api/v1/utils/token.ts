import jwt from 'jsonwebtoken'

export const createTokens = (name: string, email: string): { accessToken: string; refreshToken: string } => {
  try {
    const accessToken = jwt.sign({ user: { name, email } }, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '1d' })

    const refreshToken = jwt.sign({ user: { name, email } }, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: '30d' })

    return { accessToken, refreshToken }
  } catch (error) {
    console.log(error)
    throw error
  }
}