import express from 'express'
import { JobController } from '../controller/job.js'
import { upload } from '../middleware/imageUpload.js' 
import { verifyJwt } from '../middleware/verifyJwt.js'

export default (jobController: JobController) => {
  const router = express.Router()

  // Base route: /jobs
  router.route('/')
    .get(verifyJwt,jobController.handleGetJobs)
    // upload.single looks for 'image' in the multipart/form-data
    .post(verifyJwt,upload.single('image'), jobController.handleCreateJob)

  // ID route: /jobs/:id
  router.route('/:id')
    .get(verifyJwt,jobController.handleGetJobById)
    .patch(verifyJwt,upload.single('image'), jobController.handleUpdateJob)
    .delete(verifyJwt,jobController.handleDeleteJob)

  return router
}