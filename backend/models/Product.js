
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    image: {
      type: String,
      default: '',
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Support the public catalog's active-product filters, default date sort,
// and common category/price filtering without indexing every sort option.
productSchema.index({ isActive: 1, createdAt: -1 })
productSchema.index({ isActive: 1, price: 1 })
productSchema.index({ isActive: 1, category: 1, price: 1 })

const Product = mongoose.model('Product', productSchema)

export default Product
