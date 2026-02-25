import express from 'express'
import jwt from 'jsonwebtoken'
import { UserService } from '../service/user.js'
import { createTokens } from '../utils/token.js'
import { httpError } from '../utils/httpError.js'
import { type NextFunction } from 'express'
import httpResponse from '../utils/httpResponse.js'
import { type Payload } from '../interface/token.js'
import { type CustomRequest } from '../interface/express.js'


export class RefreshTokenController {
  private UserService: UserService

  constructor(UserService: UserService) {
    this.UserService = UserService
  }

  handleRefreshToken = async (req: CustomRequest, res: express.Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.cookies?.jwt) {
        return httpError(next, new Error('Invalid request'), req, 401)
      }
      const refreshToken = req.cookies?.jwt

      const user = await this.UserService.findOne({ refreshToken })
      res.clearCookie('jwt')

      if (!user) {
        const decoded = jwt.verify(refreshToken, `${process.env.ACCESS_TOKEN_SECRET}`) as Payload

        const hackedUser = await this.UserService.findOne({
          email: decoded.user.email
        })

        if (!hackedUser) return httpError(next, new Error('User dont exist'), req, 404)

        hackedUser.refreshToken = ['']

        await hackedUser.save()
        return httpError(next, new Error('forbiden'), req, 403)
      }

      const newRefreshTokenArray = user.refreshToken ? user.refreshToken.filter((rt) => rt !== refreshToken) : []

      const decoded = jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`) as Payload

      if (decoded.user.email !== user.email) return httpError(next, new Error('forbiden'), req, 403)

      const tokens = createTokens(user.name, user.email)

      // if (!tokens?.accessToken || !tokens?.refreshToken) {
      //   throw new Error('An error occured in createTokens function.')
      // }

      const accessToken = tokens.accessToken
      const newRefreshToken = tokens.refreshToken

      user.refreshToken = [...newRefreshTokenArray, newRefreshToken]

      await user.save()

      res.cookie('jwt', newRefreshToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none', 
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
      return httpResponse(req, res, 201, 'User Login Successful', { accessToken })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }
}