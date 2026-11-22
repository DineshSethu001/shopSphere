
import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/my-orders', protect, getMyOrders)
router.get('/my-orders/:id', protect, getMyOrderById)
router.post('/my-orders/:id/cancel', protect, cancelMyOrder)
router.get('/track/:id', trackOrder)
router.get('/', protect, adminOnly, getOrders)
router.get('/:id', protect, adminOnly, getOrderById)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router
