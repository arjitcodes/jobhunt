import express from 'express'
import { UserController } from '../controller/user.js'
import { verifyJwt } from '../middleware/verifyJwt.js'

export default (userController: UserController) => {
  const router = express.Router()

  // Base route: /users
  router.route('/')
    .post(userController.handleUserSignup)
    .patch(verifyJwt, userController.handleUserUpdate) 
    .delete(verifyJwt, userController.handleUserDelete)

  // Email route: /users/:email
  router.route('/:email')
    .get(verifyJwt, userController.handleGetUser)

  return router
}