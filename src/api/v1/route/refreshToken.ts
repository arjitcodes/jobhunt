import express from 'express'
import { RefreshTokenController } from '../controller/refreshToken.js'

export default (refreshTokenController: RefreshTokenController) => {
  const router = express.Router()

  router.route('/').post(refreshTokenController.handleRefreshToken)

  return router
}