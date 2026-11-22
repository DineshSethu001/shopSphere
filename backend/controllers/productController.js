
import Product from '../models/Product.js'

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      minPrice,
      maxPrice,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 12))
    const filter = { isActive: true }

    if (typeof search === 'string' && search.trim()) {
      const safeSearch = search.trim().slice(0, 100)
      const escapedSearch = safeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } },
      ]
    }

    if (typeof category === 'string' && category.trim()) {
      filter.category = category.trim()
    }

    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      const priceFilter = {}
      if (minPrice !== undefined && minPrice !== '') {
        const minimum = Number(minPrice)
        if (!Number.isFinite(minimum) || minimum < 0) {
          return res.status(400).json({ success: false, message: 'Minimum price must be a valid non-negative number.' })
        }
        priceFilter.$gte = minimum
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const maximum = Number(maxPrice)
        if (!Number.isFinite(maximum) || maximum < 0) {
          return res.status(400).json({ success: false, message: 'Maximum price must be a valid non-negative number.' })
        }
        priceFilter.$lte = maximum
      }
      if (priceFilter.$gte !== undefined && priceFilter.$lte !== undefined && priceFilter.$gte > priceFilter.$lte) {
        return res.status(400).json({ success: false, message: 'Minimum price cannot exceed maximum price.' })
      }
      filter.price = priceFilter
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
      rating: { rating: -1, numReviews: -1 },
    }
    const sortOrder = sortOptions[sort] || sortOptions.newest
    const skip = (currentPage - 1) * pageSize

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort(sortOrder).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage,
        pageSize,
        totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        hasNextPage: currentPage * pageSize < totalProducts,
        hasPreviousPage: currentPage > 1,
      },
    })
  } catch (error) {
    console.error('Get products error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
    })
  }
}

export const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true })
    return res.status(200).json({
      success: true,
      categories: categories.sort((a, b) => a.localeCompare(b)),
    })
  } catch (error) {
    console.error('Get categories error:', error.message)
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' })
  }
}

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    res.status(200).json({
      success: true,
      product,
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
