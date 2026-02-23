import express, {type NextFunction } from 'express'
import {  isPasswordStrong } from './../utils/password.js'
import { isValidEmail } from './../utils/validator.js'
import { createTokens } from '../utils/token.js'
import { UserService } from '../service/user.js' 
import httpResponse from '../utils/httpResponse.js'
import { httpError } from '../utils/httpError.js'
import { type CustomRequest } from '../interface/express.js'

export class UserController {
  private UserService: UserService

  // Removed OTP and RabbitMQ to keep the MVP lean
  constructor(UserService: UserService) {
    this.UserService = UserService
  }

  handleUserSignup = async (
    req: CustomRequest<{ name: string; email: string; password: string }>,
    res: express.Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cookies: Record<string, string> = req.cookies
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return httpError(next, new Error('Missing required fields'), req, 422)
      }

      if (!isValidEmail(email)) {
        return httpError(next, new Error('Invalid email address'), req, 422)
      }

      if (!isPasswordStrong(password)) {
        return httpError(next, new Error('Weak Password'), req, 422)
      }

      // Check if admin already exists before attempting to create
      const existingUser = await this.UserService.findOne({ email })
      if (existingUser) {
        return httpError(next, new Error('Email is already registered'), req, 409)
      }

      // Create the user first
      const user = await this.UserService.addOne({
        name,
        password,
        email
      })

      if (!user) {
        throw new Error('Error adding user.')
      }

      // Create tokens using JWT
      const tokens = createTokens(name, email)

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error('An error occurred in createTokens function.')
      }

      const accessToken = tokens.accessToken
      const refreshToken = tokens.refreshToken

      // Push the new refresh token into the user's token array
      await this.UserService.findOneAndUpdate(
        { email }, 
        { $push: { refreshToken: refreshToken } }
      )

      if (cookies?.jwt) res.clearCookie('jwt')

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      })

      return httpResponse(req, res, 201, 'User created successfully', { accessToken })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

  handleGetUser = async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
    try {
      // Switched from username to email since username was removed from the schema
      const { email } = req.params

      const user = await this.UserService.findOne({ email })

      if (!user) return httpError(next, new Error('User does not exist with that email'), req, 404)

      return httpResponse(req, res, 200, 'Successfully found the user', { user })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

  handleUserUpdate = async (req: CustomRequest<Record<string, unknown>>, res: express.Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.payload?.user?.email

      if (!email) return httpError(next, new Error('Unauthorized request'), req, 412)

      // Only 'name' is allowed for update right now. Passwords should typically have a separate flow.
      const allowedFields = ['name']
      const updates = Object.keys(req.body)

      const filterUpdates: Record<string, unknown> = {}

      updates.forEach((field) => {
        if (allowedFields.includes(field)) {
          filterUpdates[field] = req.body[field]
        }
      })

      if (Object.keys(filterUpdates).length === 0) {
        return httpError(next, new Error('No valid fields provided for updates'), req, 400)
      }

      const user = await this.UserService.findOneAndUpdate({ email }, filterUpdates)

      if (!user) return httpError(next, new Error('User does not exist'), req, 404)

      return httpResponse(req, res, 200, 'Successfully updated the user', { user })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }

  handleUserDelete = async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.payload?.user?.email

      if (!email) return httpError(next, new Error('Unauthorized request'), req, 422)

      const user = await this.UserService.findOneAndDelete({ email })

      if (!user) return httpError(next, new Error('User does not exist'), req, 404)

      return httpResponse(req, res, 200, 'Successfully deleted the user', { user })
    } catch (error) {
      return httpError(next, error, req, 500)
    }
  }
}