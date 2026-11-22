import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import productRoutes from './routes/productRoutes.js'
import connectDB from './config/db.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { razorpayWebhook } from './controllers/webhookController.js'
import { validateEnv } from './config/validateEnv.js'

const app = express()

app.use(helmet())
const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopSphere API is healthy",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/+$/, ''),
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']),
].filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(Object.assign(new Error('Origin not allowed by CORS'), { status: 403 }))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  // The default memory store is per process. Use a shared store when running multiple instances.
})

// Preserve the raw payload for Razorpay HMAC validation. The webhook has its own gateway authentication.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  razorpayWebhook
)

// Rate limit before parsing request bodies to reduce avoidable parser work.
app.use('/api', apiLimiter)
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/payments', paymentRoutes)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to ShopSphere API!' })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' })
})

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)

  let status = error.status || error.statusCode || (error.type === 'entity.too.large' ? 413 : 500)
  if (error.code === 'LIMIT_FILE_SIZE') status = 413
  else if (typeof error.code === 'string' && error.code.startsWith('LIMIT_')) status = 400
  console.error('API error:', error.message)

  const message = status === 403
    ? 'Origin not allowed by CORS.'
    : status === 413
      ? 'Request body is too large.'
      : status >= 500
        ? 'Internal server error.'
        : 'Request could not be processed.'

  return res.status(status).json({ success: false, message })
})

const startServer = async () => {
  try {
    validateEnv()
    const trustProxyHops = process.env.TRUST_PROXY_HOPS
    if (trustProxyHops) app.set('trust proxy', Number(trustProxyHops))

    await connectDB()
    const port = process.env.PORT || 5000
    app.listen(port, () => console.log(`ShopSphere API running on port ${port}`))
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
