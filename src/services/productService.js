import api from './api'

const normalizeProduct = (product) => ({
  ...product,
  id: product._id || product.id,
})

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params })
  return {
    products: data.products.map(normalizeProduct),
    pagination: data.pagination,
  }
}

export const fetchProductCategories = async () => {
  const { data } = await api.get('/products/categories')
  return data.categories
}

export const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return normalizeProduct(data.product)
}

export const createProduct = async (productData) => {
  const { data } = await api.post('/products', productData)
  return normalizeProduct(data.product)
}
export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData)
  return normalizeProduct(data.product)
}

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`)
  return data
}
