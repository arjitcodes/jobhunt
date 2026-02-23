import express from 'express'
import { SliderController } from '../controller/slider.js'
import { upload } from '../middleware/imageUpload.js'
import { verifyJwt } from '../middleware/verifyJwt.js'

export default (sliderController: SliderController) => {
  const router = express.Router()

  // Base route: /sliders
  router.route('/')
    .get(verifyJwt, sliderController.handleGetSliders)
    .post(verifyJwt, upload.single('image'), sliderController.handleCreateSlider)

  // ID route: /sliders/:id
  router.route('/:id')
    .patch(verifyJwt, upload.single('image'), sliderController.handleUpdateSlider)
    .delete(verifyJwt, sliderController.handleDeleteSlider)

  return router
}