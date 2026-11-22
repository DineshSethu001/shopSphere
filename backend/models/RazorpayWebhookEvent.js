import mongoose from 'mongoose'

const razorpayWebhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  processedAt: { type: Date, default: null },
  receivedAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30,
  },
})

export default mongoose.model('RazorpayWebhookEvent', razorpayWebhookEventSchema)
