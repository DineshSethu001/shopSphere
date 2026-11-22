import api from './api'

export const fetchInventory = async () => {
  const { data } = await api.get('/admin/inventory')
  return data
}

export const updateProductStock = async (id, payload) => {
  const { data } = await api.patch(`/admin/products/${id}/stock`, payload)
  return data.product
}
