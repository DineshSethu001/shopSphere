import api from './api'

export const fetchDashboardAnalytics = async () => {
  const { data } = await api.get('/admin/analytics')
  return data.analytics
}
