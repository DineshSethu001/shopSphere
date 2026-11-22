import express from 'express'
import {
  getDashboardAnalytics,
  getInventory,
  updateProductStock,
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/analytics', protect, adminOnly, getDashboardAnalytics)
router.get('/inventory', protect, adminOnly, getInventory)
router.patch('/products/:id/stock', protect, adminOnly, updateProductStock)

export default router
