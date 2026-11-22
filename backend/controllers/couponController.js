import mongoose from 'mongoose'
import Coupon from '../models/Coupon.js'

const calculateDiscount = (coupon, subtotal) => {
  let discount = coupon.discountType === 'PERCENTAGE'
    ? subtotal * coupon.discountValue / 100
    : coupon.discountValue

  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount)
  discount = Math.min(discount, subtotal)
  return Math.round(discount * 100) / 100
}

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscount = null,
      usageLimit = 100,
      expiryDate,
    } = req.body

    if (typeof code !== 'string' || !/^[A-Z0-9_-]{3,30}$/i.test(code.trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid coupon code.' })
    }
    if (
      !['PERCENTAGE', 'FIXED'].includes(discountType) ||
      typeof discountValue !== 'number' ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0 ||
      (discountType === 'PERCENTAGE' && discountValue > 100)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid discount configuration.' })
    }
    if (
      typeof minOrderAmount !== 'number' || !Number.isFinite(minOrderAmount) || minOrderAmount < 0 ||
      !Number.isInteger(usageLimit) || usageLimit < 1 ||
      (maxDiscount !== null && (typeof maxDiscount !== 'number' || !Number.isFinite(maxDiscount) || maxDiscount < 0))
    ) {
      return res.status(400).json({ success: false, message: 'Invalid coupon limits.' })
    }

    const expiry = new Date(expiryDate)
    if (!expiryDate || Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' })
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiryDate: expiry,
    })

    return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This coupon code already exists.' })
    }
    console.error('Create coupon error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to create coupon.' })
  }
}

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    return res.status(200).json({ success: true, coupons })
  } catch (error) {
    console.error('Get coupons error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons.' })
  }
}

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can apply coupons.' })
    }
    if (typeof code !== 'string' || typeof subtotal !== 'number' || !Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({ success: false, message: 'Invalid coupon request.' })
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true })
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' })
    }
    if (coupon.expiryDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' })
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' })
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}.` })
    }

    const discount = calculateDiscount(coupon, subtotal)
    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully.',
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discount,
      finalAmount: Math.round((subtotal - discount) * 100) / 100,
    })
  } catch (error) {
    console.error('Validate coupon error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to validate coupon.' })
  }
}

export const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID.' })
    }
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'A valid active status is required.' })
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true, runValidators: true }
    )

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' })
    }

    return res.status(200).json({
      success: true,
      message: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully.`,
      coupon,
    })
  } catch (error) {
    console.error('Update coupon error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' })
  }
}
