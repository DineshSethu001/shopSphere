import crypto from 'crypto'
import Order from '../models/Order.js'
import RazorpayWebhookEvent from '../models/RazorpayWebhookEvent.js'

const acknowledge = (res) => res.status(200).send('Webhook processed')

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (
      !secret ||
      typeof signature !== 'string' ||
      !/^[a-f\d]{64}$/i.test(signature) ||
      !Buffer.isBuffer(req.body)
    ) {
      return res.status(400).send('Invalid webhook request')
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex')
    const received = Buffer.from(signature, 'hex')
    const expected = Buffer.from(expectedSignature, 'hex')

    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return res.status(400).send('Invalid webhook signature')
    }

    let event
    try {
      event = JSON.parse(req.body.toString('utf8'))
    } catch {
      return res.status(400).send('Invalid webhook payload')
    }

    const eventId = req.headers['x-razorpay-event-id']
    let eventRecord
    if (typeof eventId === 'string' && eventId.trim()) {
      eventRecord = await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        { $setOnInsert: { eventId, eventType: event.event || 'unknown' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )

      if (eventRecord.processedAt) return acknowledge(res)
    }

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      if (!payment?.order_id || !payment?.id) {
        return res.status(400).send('Invalid payment payload')
      }

      const order = await Order.findOne({ razorpayOrderId: payment.order_id })
      if (!order) {
        console.error('Webhook: ShopSphere order not found')
      } else {
        const expectedAmount = Math.round(order.totalAmount * 100)
        if (
          payment.status !== 'captured' ||
          payment.amount !== expectedAmount ||
          payment.currency !== 'INR'
        ) {
          console.error('Webhook: Payment details do not match order')
        } else {
          await Order.findOneAndUpdate(
            {
              _id: order._id,
              paymentStatus: { $ne: 'PAID' },
              paymentMethod: 'ONLINE',
              razorpayOrderId: payment.order_id,
            },
            {
              $set: {
                paymentStatus: 'PAID',
                orderStatus: 'CONFIRMED',
                razorpayPaymentId: payment.id,
                paymentVerifiedAt: new Date(),
                lastPaymentFailure: { code: '', description: '', at: null },
              },
            },
            { new: true, runValidators: true }
          )
        }
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity
      if (payment?.order_id) {
        await Order.findOneAndUpdate(
          {
            razorpayOrderId: payment.order_id,
            paymentMethod: 'ONLINE',
            paymentStatus: 'PENDING',
          },
          {
            $set: {
              lastPaymentFailure: {
                code: String(payment.error_code || '').slice(0, 120),
                description: String(payment.error_description || 'Payment failed').slice(0, 500),
                at: new Date(),
              },
            },
          }
        )
      }
    } else if (event.event === 'order.paid') {
      // payment.captured performs the amount and currency checks before marking an order paid.
      console.log('Razorpay order.paid event received')
    }

    if (eventRecord) {
      await RazorpayWebhookEvent.updateOne(
        { _id: eventRecord._id, processedAt: null },
        { $set: { processedAt: new Date() } }
      )
    }

    return acknowledge(res)
  } catch (error) {
    console.error('Razorpay webhook error:', error.message)
    return res.status(500).send('Webhook processing failed')
  }
}
