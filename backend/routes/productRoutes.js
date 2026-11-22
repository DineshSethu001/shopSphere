
import express from 'express'

import {
  getProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all products
router.get('/', getProducts)
router.get('/categories', getProductCategories)

// GET product by ID
router.get('/:id', getProductById)

// Admin product management
router.post('/', protect, adminOnly, createProduct)

// UPDATE product
router.put('/:id', protect, adminOnly, updateProduct)

// DELETE product
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router
