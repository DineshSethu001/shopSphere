import api from './api'

const normalizeProduct = (product) => ({
  ...product,
  id: product._id || product.id,
})

export const fetchWishlist = async () => {
  const { data } = await api.get('/wishlist')
  return (data.wishlist || []).filter(Boolean).map(normalizeProduct)
}

export const addWishlistItem = async (productId) => {
  const { data } = await api.post('/wishlist', { productId })
  return data
}

export const removeWishlistItem = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`)
  return data
}
