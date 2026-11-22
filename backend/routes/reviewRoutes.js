import express from 'express'
import { createOrUpdateReview, getProductReviews } from '../controllers/reviewController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:productId', getProductReviews)
router.post('/:productId', protect, createOrUpdateReview)

export default router
