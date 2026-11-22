import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

const completedRevenueMatch = {
  $or: [
    { paymentStatus: 'PAID' },
    { orderStatus: 'DELIVERED' },
  ],
}

export const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
    )

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      revenueResult,
      lowStockProducts,
      recentOrders,
      monthlySalesResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: completedRevenueMatch },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.find({ isActive: true, stock: { $lte: 5 } })
        .select('name stock price image')
        .sort({ stock: 1 })
        .limit(6),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerName email totalAmount orderStatus paymentStatus createdAt'),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            ...completedRevenueMatch,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ])

    const salesMap = new Map(
      monthlySalesResult.map(({ _id, revenue }) => [
        `${_id.year}-${String(_id.month).padStart(2, '0')}`,
        revenue,
      ])
    )

    const monthlySales = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1)
      )
      const key = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, '0')}`

      return {
        month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        revenue: salesMap.get(key) || 0,
      }
    })

    return res.status(200).json({
      success: true,
      analytics: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: revenueResult[0]?.total || 0,
        lowStockProducts,
        recentOrders,
        monthlySales,
      },
    })
  } catch (error) {
    console.error('Dashboard analytics error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics.',
    })
  }
}

export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    const { stock, adjustment } = body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' })
    }

    const hasStock = Object.prototype.hasOwnProperty.call(body, 'stock')
    const hasAdjustment = Object.prototype.hasOwnProperty.call(body, 'adjustment')
    if (hasStock === hasAdjustment) {
      return res.status(400).json({ success: false, message: 'Provide either stock or adjustment.' })
    }

    let product
    if (hasStock) {
      if (!Number.isSafeInteger(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: 'Stock must be a non-negative whole number.' })
      }
      product = await Product.findByIdAndUpdate(
        id,
        { $set: { stock } },
        { new: true, runValidators: true }
      )
    } else {
      if (!Number.isSafeInteger(adjustment) || adjustment === 0) {
        return res.status(400).json({ success: false, message: 'Adjustment must be a non-zero whole number.' })
      }
      const stockConstraint = adjustment < 0
        ? { $gte: Math.abs(adjustment) }
        : { $lte: Number.MAX_SAFE_INTEGER - adjustment }
      product = await Product.findOneAndUpdate(
        { _id: id, stock: stockConstraint },
        { $inc: { stock: adjustment } },
        { new: true, runValidators: true }
      )
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or stock adjustment is out of range.' })
    }

    return res.status(200).json({ success: true, message: 'Inventory updated successfully.', product })
  } catch (error) {
    console.error('Stock update error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to update inventory.' })
  }
}

export const getInventory = async (req, res) => {
  try {
    const products = await Product.find({})
      .select('name category price stock image isActive')
      .sort({ stock: 1 })
      .lean()
    const activeProducts = products.filter((product) => product.isActive)

    return res.status(200).json({
      success: true,
      products,
      summary: {
        totalProducts: products.length,
        lowStockCount: activeProducts.filter((product) => product.stock <= 5).length,
        outOfStockCount: activeProducts.filter((product) => product.stock === 0).length,
      },
    })
  } catch (error) {
    console.error('Get inventory error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to load inventory.' })
  }
}
