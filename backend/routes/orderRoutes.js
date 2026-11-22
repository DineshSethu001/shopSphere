
import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
} from '../controllers/orderController.js'

const router = express.Router()

router.post('/', createOrder)
router.get('/', getOrders)
router.get('/track/:id', trackOrder)
router.get('/:id', getOrderById)
router.put('/:id/status', updateOrderStatus)

export default router
