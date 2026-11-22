
import api from './api'

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData)
  return data
}

export const fetchOrders = async () => {
  const { data } = await api.get('/orders')
  return data.orders
}

export const fetchMyOrders = async () => {
  const { data } = await api.get('/orders/my-orders')
  return data.orders
}

export const fetchMyOrderById = async (id) => {
  const { data } = await api.get(`/orders/my-orders/${id}`)
  return data.order
}

export const cancelMyOrder = async (id, reason = '') => {
  const { data } = await api.post(`/orders/my-orders/${id}/cancel`, { reason })
  return data
}

export const fetchOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`)
  return data.order
}

export const updateOrderStatus = async (id, orderStatus) => {
  const { data } = await api.put(`/orders/${id}/status`, { orderStatus })
  return data.order
}
export const trackOrder = async (orderId, email) => {
  const { data } = await api.get(
    `/orders/track/${orderId}`,
    {
      params: { email },
    }
  )

  return data.order
}
