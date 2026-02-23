import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 1. Ensure the upload directory exists before Multer tries to save to it
const uploadDir = 'public/uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 2. Configure Storage (Where and how to save the file)
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir)
  },
  filename: (_, file, cb) => {
    // Create a unique filename: fieldname-timestamp-random.ext
    // Example: image-1708723456789-123456789.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  }
})

// 3. File Filter (Reject non-image files)
const fileFilter = (
  _: any, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true) // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'))
  }
}

// 4. Export the configured middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max file size
  },
  fileFilter
})