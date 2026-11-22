import express from 'express'
import {
  createCoupon,
  getCoupons,
  updateCouponStatus,
  validateCoupon,
} from '../controllers/couponController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/validate', protect, validateCoupon)
router.get('/', protect, adminOnly, getCoupons)
router.post('/', protect, adminOnly, createCoupon)
router.patch('/:id/status', protect, adminOnly, updateCouponStatus)

export default router
