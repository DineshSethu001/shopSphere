import api from './api'

export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post('/payments/create-order', { orderId })
  return data
}

export const verifyRazorpayPayment = async (paymentData) => {
  const { data } = await api.post('/payments/verify', paymentData)
  return data
}
