
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'

// CREATE ORDER
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      items,
      paymentMethod,
    } = req.body

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

    const productQuantities = new Map()

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID or quantity.',
        })
      }

      const key = item.productId.toString()

      productQuantities.set(
        key,
        (productQuantities.get(key) || 0) + item.quantity
      )
    }

    const orderItems = []
    let totalAmount = 0

    // Start MongoDB transaction
    await session.withTransaction(async () => {
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

        totalAmount += itemTotal

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        })
      }

      const newOrder = await Order.create(
        [
          {
            customerName,
            email,
            phone,
            shippingAddress,
            items: orderItems,
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
    const allowedStatuses = [
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]

    const { orderStatus } = req.body

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

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
