import express from 'express'
import { AuthController } from '../controller/auth.js'
import { verifyJwt } from '../middleware/verifyJwt.js'

export default (authControler: AuthController) => {
  const router = express.Router()

  router.route('/').post(authControler.handleUserLogin)
  router.route('/logout').post(verifyJwt, authControler.handleLogOut)

  return router
}