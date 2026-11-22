
import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true)
  } else {
    const error = new Error('Only JPEG, PNG and WEBP images are allowed.')
    error.status = 400
    callback(error)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

export default upload
