
import cloudinary from '../config/cloudinary.js'
import sharp from 'sharp'

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image.',
      })
    }

    let metadata
    try {
      metadata = await sharp(req.file.buffer, {
        failOn: 'error',
        limitInputPixels: 40_000_000,
      }).metadata()
    } catch {
      return res.status(400).json({ success: false, message: 'The uploaded image is malformed or unsupported.' })
    }
    const imageMimeTypes = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }

    if (!imageMimeTypes[metadata.format] || imageMimeTypes[metadata.format] !== req.file.mimetype) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file content does not match a supported image type.',
      })
    }

    // Decode and re-encode the upload to strip metadata and reject malformed image data.
    let sanitizedImage
    try {
      sanitizedImage = await sharp(req.file.buffer, {
        failOn: 'error',
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .toFormat(metadata.format)
        .toBuffer()
    } catch {
      return res.status(400).json({ success: false, message: 'The uploaded image could not be decoded.' })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'shopsphere/products',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      stream.end(sanitizedImage)
    })

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Image upload error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Image upload failed.',
    })
  }
}
