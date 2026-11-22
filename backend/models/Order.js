
import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        image: String,

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    couponCode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD',
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },

    razorpayOrderId: {
      type: String,
      default: '',
    },

    razorpayPaymentId: {
      type: String,
      default: '',
    },

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    lastPaymentFailure: {
      code: { type: String, default: '' },
      description: { type: String, default: '' },
      at: { type: Date, default: null },
    },

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '', trim: true },
    stockRestoredAt: { type: Date, default: null },
    couponUsageRestoredAt: { type: Date, default: null },

    orderStatus: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
