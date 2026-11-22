import { useEffect, useState } from 'react'
import { fetchProducts } from '../services/productService'

const useProducts = (params = {}) => {
  const {
    search = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
    page = 1,
    limit = 12,
  } = params

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')
        const result = await fetchProducts({
          search,
          category,
          minPrice,
          maxPrice,
          sort,
          page,
          limit,
        })

        if (active) {
          setProducts(result.products)
          setPagination(result.pagination)
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load products.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [search, category, minPrice, maxPrice, sort, page, limit])

  return { products, pagination, loading, error }
}

export default useProducts
