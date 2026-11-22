import crypto from 'crypto'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import { getRazorpayClient } from '../config/razorpay.js'

const missingCredentials = (res) => res.status(503).json({
  success: false,
  message: 'Online payments are not configured. Add Razorpay test credentials to the backend environment.',
})

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid ShopSphere order ID.' })
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) {
      return res.status(404).json({ success: false, message: 'ShopSphere order not found.' })
    }
    if (order.paymentMethod !== 'ONLINE') {
      return res.status(400).json({ success: false, message: 'This order is not an online payment order.' })
    }
    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'This order cannot accept another payment.' })
    }

    const amount = Math.round(order.totalAmount * 100)
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount.' })
    }

    const razorpay = getRazorpayClient()
    if (!razorpay) return missingCredentials(res)

    let gatewayOrderId = order.razorpayOrderId
    let gatewayAmount = amount
    let currency = 'INR'

    if (!gatewayOrderId) {
      const gatewayOrder = await razorpay.orders.create({
        amount,
        currency,
        receipt: order._id.toString(),
        notes: {
          shopSphereOrderId: order._id.toString(),
          customerId: req.user._id.toString(),
        },
      })
      gatewayOrderId = gatewayOrder.id
      gatewayAmount = gatewayOrder.amount
      currency = gatewayOrder.currency
      order.razorpayOrderId = gatewayOrderId
      await order.save()
    }

    return res.status(200).json({
      success: true,
      razorpayOrderId: gatewayOrderId,
      amount: gatewayAmount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Razorpay order error:', error.message)
    return res.status(502).json({ success: false, message: 'Unable to initialize online payment.' })
  }
}

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      shopSphereOrderId,
    } = req.body

    if (
      typeof razorpayOrderId !== 'string' ||
      typeof razorpayPaymentId !== 'string' ||
      typeof razorpaySignature !== 'string' ||
      !/^[a-f\d]{64}$/i.test(razorpaySignature) ||
      !mongoose.isValidObjectId(shopSphereOrderId)
    ) {
      return res.status(400).json({ success: false, message: 'Payment verification details are incomplete or invalid.' })
    }

    const order = await Order.findOne({ _id: shopSphereOrderId, user: req.user._id })
    if (!order) {
      return res.status(404).json({ success: false, message: 'ShopSphere order not found.' })
    }
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, message: 'Payment has already been verified.', order })
    }
    if (
      order.paymentMethod !== 'ONLINE' ||
      order.paymentStatus !== 'PENDING' ||
      order.razorpayOrderId !== razorpayOrderId
    ) {
      return res.status(400).json({ success: false, message: 'Payment does not match this order.' })
    }

    const razorpay = getRazorpayClient()
    if (!razorpay) return missingCredentials(res)

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')
    const received = Buffer.from(razorpaySignature, 'hex')
    const expected = Buffer.from(expectedSignature, 'hex')

    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' })
    }

    const payment = await razorpay.payments.fetch(razorpayPaymentId)
    const expectedAmount = Math.round(order.totalAmount * 100)
    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== 'INR' ||
      payment.status !== 'captured'
    ) {
      return res.status(400).json({ success: false, message: 'Payment is not captured or does not match the order.' })
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        paymentStatus: 'PENDING',
        razorpayOrderId,
      },
      {
        $set: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          razorpayPaymentId,
          paymentVerifiedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )

    if (!updatedOrder) {
      return res.status(409).json({ success: false, message: 'Order payment status changed. Please refresh your orders.' })
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully.', order: updatedOrder })
  } catch (error) {
    console.error('Payment verification error:', error.message)
    return res.status(502).json({
      success: false,
      message: 'Payment verification failed. Please contact support if money was deducted.',
    })
  }
}
