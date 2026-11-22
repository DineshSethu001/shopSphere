import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Review from '../models/Review.js'

const updateProductRating = async (productId) => {
  const [summary] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ])

  await Product.findByIdAndUpdate(productId, {
    rating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    numReviews: summary?.totalReviews || 0,
  })
}

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' })
    }

    const productExists = await Product.exists({ _id: productId, isActive: true })
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })

    return res.status(200).json({ success: true, count: reviews.length, reviews })
  } catch (error) {
    console.error('Get reviews error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' })
  }
}

export const createOrUpdateReview = async (req, res) => {
  try {
    const { productId } = req.params
    const { rating, comment } = req.body

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' })
    }
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can submit reviews.' })
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a whole number from 1 to 5.' })
    }
    if (typeof comment !== 'string' || comment.trim().length < 10 || comment.trim().length > 1000) {
      return res.status(400).json({ success: false, message: 'Review must be between 10 and 1000 characters.' })
    }

    const product = await Product.findOne({ _id: productId, isActive: true })
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }

    const purchased = await Order.exists({
      user: req.user._id,
      orderStatus: 'DELIVERED',
      'items.product': productId,
    })
    if (!purchased) {
      return res.status(403).json({
        success: false,
        message: 'You can review this product after it has been delivered.',
      })
    }

    const review = await Review.findOneAndUpdate(
      { product: productId, user: req.user._id },
      {
        $set: { rating, comment: comment.trim() },
        $setOnInsert: { product: productId, user: req.user._id },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'name')

    await updateProductRating(productId)

    return res.status(200).json({ success: true, message: 'Review saved successfully.', review })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product.' })
    }
    console.error('Save review error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to save review.' })
  }
}
