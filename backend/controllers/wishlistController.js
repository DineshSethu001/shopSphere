import mongoose from 'mongoose'
import User from '../models/User.js'
import Product from '../models/Product.js'

const populatedUserWishlist = (userId) => User.findById(userId)
  .populate({ path: 'wishlist', match: { isActive: true } })

export const getWishlist = async (req, res) => {
  try {
    const user = await populatedUserWishlist(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    return res.status(200).json({ success: true, wishlist: user.wishlist })
  } catch (error) {
    console.error('Get wishlist error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' })
  }
}

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' })
    }

    const product = await Product.findOne({ _id: productId, isActive: true })
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: product._id } },
      { new: true }
    ).populate({ path: 'wishlist', match: { isActive: true } })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist.',
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error('Add wishlist error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to add product to wishlist.' })
  }
}

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate({ path: 'wishlist', match: { isActive: true } })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error('Remove wishlist error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to remove product.' })
  }
}
