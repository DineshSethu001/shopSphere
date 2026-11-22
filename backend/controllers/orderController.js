
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'

// CREATE ORDER
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const {
      phone,
      shippingAddress,
      items,
      paymentMethod,
      couponCode: submittedCouponCode,
    } = req.body
    const customerName = req.user.name
    const email = req.user.email

    // Basic validation
    if (
      !customerName ||
      !email ||
      !phone ||
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete customer and address details.',
      })
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.',
      })
    }

    if (
      paymentMethod &&
      !['COD', 'ONLINE'].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      })
    }

    if (submittedCouponCode != null && typeof submittedCouponCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code.',
      })
    }

    const productQuantities = new Map()

    for (const item of items) {
      const productId = item?.productId || item?.product || item?.id
      if (
        !item ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID or quantity.',
        })
      }

      const key = productId.toString()

      productQuantities.set(
        key,
        (productQuantities.get(key) || 0) + item.quantity
      )
    }

    if ([...productQuantities.values()].some((quantity) => quantity > 100)) {
      return res.status(400).json({
        success: false,
        message: 'A product quantity cannot exceed 100.',
      })
    }

    const orderItems = []
    let subtotal = 0
    let discountAmount = 0
    let couponCode = ''

    // Start MongoDB transaction
    await session.withTransaction(async () => {
      orderItems.length = 0
      subtotal = 0
      discountAmount = 0
      couponCode = ''

      for (const [productId, quantity] of productQuantities) {

        // Atomically check stock and deduct quantity
        const product = await Product.findOneAndUpdate(
          {
            _id: productId,
            isActive: true,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          {
            new: true,
            session,
          }
        )

        if (!product) {
          throw new Error(
            `Product ${productId} is unavailable or has insufficient stock.`
          )
        }

        const itemTotal = product.price * quantity

        subtotal += itemTotal

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        })
      }

      subtotal = Math.round(subtotal * 100) / 100

      if (typeof submittedCouponCode === 'string' && submittedCouponCode.trim()) {
        const normalizedCode = submittedCouponCode.trim().toUpperCase()
        const now = new Date()
        const coupon = await Coupon.findOne({
          code: normalizedCode,
          isActive: true,
          expiryDate: { $gt: now },
        }).session(session)

        if (!coupon) {
          throw new Error('Coupon is invalid, inactive, or expired.')
        }
        if (coupon.usedCount >= coupon.usageLimit) {
          throw new Error('Coupon usage limit reached.')
        }
        if (subtotal < coupon.minOrderAmount) {
          throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}.`)
        }

        discountAmount = coupon.discountType === 'PERCENTAGE'
          ? subtotal * coupon.discountValue / 100
          : coupon.discountValue
        if (coupon.maxDiscount != null) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount)
        }
        discountAmount = Math.round(Math.min(discountAmount, subtotal) * 100) / 100

        const reservedCoupon = await Coupon.findOneAndUpdate(
          {
            _id: coupon._id,
            isActive: true,
            expiryDate: { $gt: now },
            usedCount: { $lt: coupon.usageLimit },
          },
          { $inc: { usedCount: 1 } },
          { new: true, session }
        )

        if (!reservedCoupon) {
          throw new Error('Coupon usage limit reached or coupon expired.')
        }
        couponCode = coupon.code
      }

      const totalAmount = Math.round((subtotal - discountAmount) * 100) / 100

      const newOrder = await Order.create(
        [
          {
            user: req.user._id,
            customerName,
            email,
            phone,
            shippingAddress,
            items: orderItems,
            subtotal,
            couponCode,
            discountAmount,
            totalAmount,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: 'PENDING',
            orderStatus: 'PENDING',
          },
        ],
        { session }
      )

      // Save created order ID for the response
      req.createdOrder = newOrder[0]
    })

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: req.createdOrder,
    })

  } catch (error) {
    console.error('Create order error:', error.message)

    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to create order.',
    })

  } finally {
    await session.endSession()
  }
}

// GET ORDERS BELONGING TO THE AUTHENTICATED CUSTOMER
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    console.error('My orders error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders.',
    })
  }
}

// GET ONE ORDER ONLY WHEN IT BELONGS TO THE AUTHENTICATED CUSTOMER
export const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const order = await Order.findOne({ _id: id, user: req.user._id })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    return res.status(200).json({ success: true, order })
  } catch (error) {
    console.error('Order details error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details.',
    })
  }
}


// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    res.status(200).json({
      success: true,
      order,
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body
    const transitions = {
      PENDING: ['CONFIRMED', 'SHIPPED', 'DELIVERED'],
      CONFIRMED: ['SHIPPED', 'DELIVERED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    }

    if (!Object.values(transitions).flat().includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const currentOrder = await Order.findById(req.params.id)

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    if (!transitions[currentOrder.orderStatus]?.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move an order from ${currentOrder.orderStatus} to ${orderStatus}.`,
      })
    }

    currentOrder.orderStatus = orderStatus
    const order = await currentOrder.save()

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order,
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params
    const email = req.query.email?.trim().toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(id) || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid order ID and email.',
      })
    }

    const order = await Order.findOne({
      _id: id,
      email,
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found. Check your order ID and email.',
      })
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to track this order.',
    })
  }
}

export const cancelMyOrder = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const { id } = req.params
    const reason = String(req.body?.reason || 'Cancelled by customer')
      .trim()
      .slice(0, 300)

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' })
    }

    let cancelledOrder
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: id, user: req.user._id }).session(session)
      if (!order) throw new Error('ORDER_NOT_FOUND')

      if (order.orderStatus === 'CANCELLED') {
        cancelledOrder = order
        return
      }

      if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
        throw new Error('ORDER_CANNOT_BE_CANCELLED')
      }
      if (order.paymentStatus === 'PAID') {
        throw new Error('PAID_ORDER_REQUIRES_REFUND')
      }
      if (order.paymentMethod === 'ONLINE' && order.razorpayOrderId) {
        throw new Error('ONLINE_PAYMENT_RECONCILIATION_REQUIRED')
      }

      const now = new Date()
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          user: req.user._id,
          orderStatus: { $in: ['PENDING', 'CONFIRMED'] },
          paymentStatus: { $ne: 'PAID' },
          stockRestoredAt: null,
        },
        {
          $set: {
            orderStatus: 'CANCELLED',
            cancelledAt: now,
            cancelReason: reason,
            stockRestoredAt: now,
            couponUsageRestoredAt: now,
          },
        },
        { new: true, session }
      )

      if (!updatedOrder) throw new Error('ORDER_CANCELLATION_CONFLICT')

      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session }
        )
        if (result.matchedCount !== 1) throw new Error('PRODUCT_RESTORATION_FAILED')
      }

      if (order.couponCode) {
        const restoredCoupon = await Coupon.findOneAndUpdate(
          { code: order.couponCode, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } },
          { new: true, session }
        )
        if (!restoredCoupon) {
          // The coupon may have been deleted or already exhausted; inventory and cancellation can still complete.
          console.warn(`Coupon ${order.couponCode} was unavailable during order cancellation ${order._id}.`)
        }
      }

      cancelledOrder = updatedOrder
    })

    return res.status(200).json({
      success: true,
      message: 'Order cancelled and inventory restored.',
      order: cancelledOrder,
    })
  } catch (error) {
    const errors = {
      ORDER_NOT_FOUND: [404, 'Order not found.'],
      ORDER_CANNOT_BE_CANCELLED: [400, 'This order can no longer be cancelled.'],
      PAID_ORDER_REQUIRES_REFUND: [409, 'This order has been paid. A refund process is required.'],
      ONLINE_PAYMENT_RECONCILIATION_REQUIRED: [409, 'Online payment is awaiting reconciliation. Please contact support.'],
      ORDER_CANCELLATION_CONFLICT: [409, 'Order status changed. Refresh and try again.'],
      PRODUCT_RESTORATION_FAILED: [500, 'Could not restore product inventory.'],
    }
    const mapped = errors[error.message]
    console.error('Cancel order error:', error.message)
    return res.status(mapped?.[0] || 500).json({
      success: false,
      message: mapped?.[1] || 'Unable to cancel this order.',
    })
  } finally {
    await session.endSession()
  }
}
