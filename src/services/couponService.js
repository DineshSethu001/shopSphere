import api from './api'

export const validateCoupon = async (code, subtotal) => {
  const { data } = await api.post('/coupons/validate', { code, subtotal })
  return data
}

export const createCoupon = async (couponData) => {
  const { data } = await api.post('/coupons', couponData)
  return data
}

export const fetchCoupons = async () => {
  const { data } = await api.get('/coupons')
  return data.coupons
}

export const updateCouponStatus = async (id, isActive) => {
  const { data } = await api.patch(`/coupons/${id}/status`, { isActive })
  return data.coupon
}
