import express, {type NextFunction } from 'express'
import { verifyHashedPassword } from './../utils/password.js'
import { isValidEmail} from './../utils/validator.js'
import { createTokens } from './../utils/token.js'

import { UserService } from '../service/user.js'
import { httpError } from '../utils/httpError.js'
import httpResponse from '../utils/httpResponse.js'
import { type Payload } from '../interface/token.js'
import jwt from 'jsonwebtoken'
import type { CustomRequest } from '../interface/express.js'

export class AuthController {
  private userService: UserService

  constructor(userService: UserService) {
    this.userService = userService
  }

  handleUserLogin = async (req: CustomRequest<{ email: string; password: string }>, res: express.Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body

      if (!email || !password) return httpError(next, new Error('Invalid credentials'), req, 422)

      const user = await this.userService.findOne({ email })

      if (!user) return httpError(next, new Error('Invalid credentials'), req, 404)

      const isPasswordMatch = await verifyHashedPassword(password, user.password)
      if (!isPasswordMatch) return httpError(next, new Error('Invalid credentials'), req, 401)

      // Create tokens
      const tokens = createTokens(user.name, email)

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error('An error occurred in createTokens function.')
      }

      const newAccessToken = tokens.accessToken
      const newRefreshToken = tokens.refreshToken

      // 1. Filter out the old cookie token from the array in memory
      let newRefreshTokenArray: string[] = !req.cookies?.jwt
        ? user.refreshToken || []
        : user.refreshToken?.filter((rt) => rt !== req.cookies.jwt) || []

      // 2. Handle existing cookie logic
      if (req.cookies?.jwt) {
        const cookieToken = req.cookies.jwt // Renamed to prevent variable shadowing
        const foundTokenUser = await this.userService.findOne({ refreshToken: cookieToken })

        // Refresh token reuse detected!
        if (!foundTokenUser) {
          console.log('Refresh token reuse detected')
          newRefreshTokenArray = [] // Clear all tokens for security
        } 
        // If the cookie belongs to a DIFFERENT user (e.g., they switched accounts)
        else if (foundTokenUser.email !== user.email) {
          const oldUserRefreshTokenArray = foundTokenUser.refreshToken 
            ? foundTokenUser.refreshToken.filter((rt) => rt !== cookieToken) 
            : []
          
          foundTokenUser.refreshToken = oldUserRefreshTokenArray
          await foundTokenUser.save() // Safe to save here, because foundTokenUser is NOT our current user
        }

        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'none' })
      }

      // 3. Save the current user EXACTLY ONCE at the very end
      user.refreshToken = [...newRefreshTokenArray, newRefreshToken]
      await user.save()

      res.cookie('jwt', newRefreshToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000 
      })
      
      return httpResponse(req, res, 201, 'User login successfully', { accessToken: newAccessToken })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }



  handleLogOut = async (req: CustomRequest, res: express.Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.payload?.user.email
      const cookies = req.cookies

      if (!email || !cookies?.jwt) return httpError(next, new Error('Invalid credenials'), req, 422)
      const user = await this.userService.findOne({ email })

      if (!user) return httpError(next, new Error('Invalid credenials'), req, 404)

      const newRefreshTokenArray: string[] = user.refreshToken ? user.refreshToken.filter((rt) => rt !== req.cookies.jwt) : []

      res.clearCookie('jwt')

      user.refreshToken = [...newRefreshTokenArray]
      await user.save()

      return httpResponse(req, res, 201, 'User logout succesfully')
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

}