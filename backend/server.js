
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/productRoutes.js'
import connectDB from './config/db.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/uploads', uploadRoutes)
// Test API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ShopSphere API!',
    database: 'MongoDB connected'
  })
})

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB()

    const PORT = process.env.PORT || 5000

    app.listen(PORT, () => {
      console.log(`ShopSphere server running on port ${PORT}`)
    })

  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
