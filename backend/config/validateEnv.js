const requiredVariables = ['MONGODB_URI', 'JWT_SECRET']
const razorpayVariables = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
]
const cloudinaryVariables = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

export const validateEnv = () => {
  const missing = requiredVariables.filter((key) => !process.env[key]?.trim())
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }

  if (process.env.JWT_SECRET.trim().length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.')
  }

  const razorpayConfigured = razorpayVariables.filter((key) => process.env[key]?.trim())
  if (razorpayConfigured.length > 0) {
    const missingRazorpay = razorpayVariables.filter((key) => !process.env[key]?.trim())
    if (missingRazorpay.length) {
      throw new Error(`Online payments require all Razorpay variables: ${missingRazorpay.join(', ')}`)
    }
    if (process.env.RAZORPAY_KEY_SECRET.trim() === process.env.RAZORPAY_WEBHOOK_SECRET.trim()) {
      throw new Error('Razorpay API and webhook secrets must be different.')
    }
  }

  const cloudinaryConfigured = cloudinaryVariables.filter((key) => process.env[key]?.trim())
  if (cloudinaryConfigured.length > 0) {
    const missingCloudinary = cloudinaryVariables.filter((key) => !process.env[key]?.trim())
    if (missingCloudinary.length) {
      throw new Error(`Cloudinary requires all configuration variables: ${missingCloudinary.join(', ')}`)
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL?.trim()) {
      throw new Error('FRONTEND_URL is required in production.')
    }
    let frontendUrl
    try {
      frontendUrl = new URL(process.env.FRONTEND_URL)
    } catch {
      throw new Error('FRONTEND_URL must be a valid HTTP or HTTPS URL.')
    }
    if (frontendUrl.protocol !== 'https:') {
      throw new Error('FRONTEND_URL must use HTTPS in production.')
    }
    if (frontendUrl.pathname !== '/' || frontendUrl.search || frontendUrl.hash) {
      throw new Error('FRONTEND_URL must contain only an origin, without a path.')
    }
  }

  if (process.env.TRUST_PROXY_HOPS) {
    const hops = Number(process.env.TRUST_PROXY_HOPS)
    if (!Number.isInteger(hops) || hops < 1 || hops > 10) {
      throw new Error('TRUST_PROXY_HOPS must be an integer from 1 to 10.')
    }
  }
}
