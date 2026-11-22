import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchDashboardAnalytics } from '../services/adminService'

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value || 0)

const dateFormat = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchDashboardAnalytics()
      setAnalytics(data)
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load dashboard analytics.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading && !analytics) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <span className="sr-only">Loading dashboard analytics</span>
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <AlertTriangle size={40} className="mb-4 text-red-500" />
        <p className="mb-4 text-gray-700" role="alert">{error}</p>
        <button onClick={loadAnalytics} className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
          Try Again
        </button>
      </main>
    )
  }

  const stats = [
    { title: 'Total Revenue', value: currency(analytics?.totalRevenue), icon: IndianRupee, tone: 'bg-green-100 text-green-700' },
    { title: 'Total Orders', value: analytics?.totalOrders ?? 0, icon: ShoppingBag, tone: 'bg-blue-100 text-blue-700' },
    { title: 'Total Products', value: analytics?.totalProducts ?? 0, icon: Package, tone: 'bg-purple-100 text-purple-700' },
    { title: 'Total Customers', value: analytics?.totalCustomers ?? 0, icon: Users, tone: 'bg-orange-100 text-orange-700' },
  ]
  const sales = analytics?.monthlySales || []
  const maxRevenue = Math.max(...sales.map((item) => item.revenue), 1)

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-2 text-gray-500">Your store performance and latest activity.</p>
        </div>
        <button onClick={loadAnalytics} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 hover:bg-gray-100 disabled:opacity-60">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      <section aria-label="Store statistics" className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, tone }) => (
          <article key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`rounded-xl p-4 ${tone}`}><Icon size={24} /></div>
            </div>
          </article>
        ))}
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-8 flex items-center gap-3">
            <span className="rounded-xl bg-green-100 p-3 text-green-700"><TrendingUp size={22} /></span>
            <div>
              <h2 className="font-bold text-gray-900">Monthly Revenue</h2>
              <p className="text-sm text-gray-500">Last six months · Paid and delivered orders</p>
            </div>
          </div>
          <div className="flex h-64 items-end justify-around gap-3 border-b border-gray-200 pb-2" role="img" aria-label="Monthly revenue bar chart">
            {sales.map((item, index) => {
              const height = item.revenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 5) : 0
              return (
                <div key={`${item.month}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="max-w-full truncate text-xs text-gray-500">{currency(item.revenue)}</span>
                  <div className="flex h-full w-full max-w-12 items-end">
                    <div className="w-full rounded-t-lg bg-blue-600 transition hover:bg-blue-700" style={{ height: `${height}%` }} title={`${item.month}: ${currency(item.revenue)}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{item.month}</span>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-xl bg-red-100 p-3 text-red-600"><AlertTriangle size={22} /></span>
            <div>
              <h2 className="font-bold text-gray-900">Low Stock Alert</h2>
              <p className="text-sm text-gray-500">Products with five or fewer units</p>
            </div>
          </div>
          <div className="space-y-4">
            {analytics?.lowStockProducts?.length ? analytics.lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0">
                {product.image ? (
                  <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100"><Package size={20} /></span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{currency(product.price)}</p>
                </div>
                <span className="whitespace-nowrap rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{product.stock} left</span>
              </div>
            )) : <p className="py-8 text-center text-sm text-gray-500">No low-stock products. Great job!</p>}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <p className="mt-1 text-sm text-gray-500">Your latest five orders</p>
          </div>
          <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Manage orders</Link>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4">Payment</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {analytics?.recentOrders?.length ? analytics.recentOrders.map((order) => (
                <tr key={order._id} className="border-t border-gray-100 text-sm">
                  <td className="p-4"><p className="font-medium text-gray-800">{order.customerName}</p><p className="text-xs text-gray-500">{order.email}</p></td>
                  <td className="whitespace-nowrap p-4 text-gray-600">{dateFormat(order.createdAt)}</td>
                  <td className="whitespace-nowrap p-4 font-semibold text-gray-800">{currency(order.totalAmount)}</td>
                  <td className="p-4">{order.paymentStatus}</td>
                  <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{order.orderStatus}</span></td>
                </tr>
              )) : <tr><td colSpan="5" className="p-8 text-center text-gray-500">No orders found yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard
