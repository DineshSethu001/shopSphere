import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchMyOrders } from '../services/orderService'

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0)

const dateFormat = (value) => new Date(value).toLocaleString('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const orderSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchMyOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load your orders.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-500">View your purchases and track your deliveries.</p>
          </div>
          <button onClick={loadOrders} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 hover:bg-gray-100 disabled:opacity-50">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </header>

        <section className="mb-6 flex items-center gap-4 rounded-2xl border bg-white p-5">
          <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><ShoppingBag size={25} /></span>
          <div><p className="text-sm text-gray-500">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></div>
        </section>

        {loading && orders.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center" role="status">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <span className="sr-only">Loading your orders</span>
          </div>
        ) : error && orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="mb-4 text-red-600" role="alert">{error}</p>
            <button onClick={loadOrders} className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Try Again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <Package size={55} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>
            <p className="mb-6 mt-2 text-gray-500">Your purchases will appear here.</p>
            <Link to="/products" className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id
              const progress = orderSteps.indexOf(order.orderStatus)
              const isCancelled = order.orderStatus === 'CANCELLED'

              return (
                <article key={order._id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs text-gray-500">ORDER ID</p>
                        <p className="mt-1 font-semibold text-gray-800">#{String(order._id).slice(-8).toUpperCase()}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500"><CalendarDays size={15} />{dateFormat(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div><p className="text-xs text-gray-500">TOTAL AMOUNT</p><p className="mt-1 text-lg font-bold">{currency(order.totalAmount)}</p></div>
                        <span className={`rounded-full px-3 py-2 text-xs font-semibold ${isCancelled ? 'bg-red-100 text-red-700' : order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.orderStatus}</span>
                      </div>
                    </div>

                    {isCancelled ? (
                      <p className="mt-5 text-sm text-red-600">This order has been cancelled.</p>
                    ) : (
                      <div className="mt-8" aria-label={`Order progress: ${order.orderStatus.toLowerCase()}`}>
                        <div className="flex items-center">
                          {orderSteps.map((step, index) => {
                            const complete = progress >= index
                            return (
                              <div key={step} className="relative flex flex-1 flex-col items-center">
                                {index > 0 && <span className={`absolute right-1/2 top-4 h-1 w-full ${progress >= index ? 'bg-green-500' : 'bg-gray-200'}`} />}
                                <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${complete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                  {complete ? <CheckCircle size={17} /> : index === 2 ? <Truck size={16} /> : <Clock size={16} />}
                                </span>
                                <span className="mt-2 text-center text-[10px] text-gray-500 sm:text-xs">{step}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <button onClick={() => setExpandedOrder(isExpanded ? null : order._id)} aria-expanded={isExpanded} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <Link to={`/my-orders/${order._id}`} className="mt-6 ml-5 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-700">
                      Full order details <ChevronRight size={17} />
                    </Link>
                  </div>

                  {isExpanded && (
                    <div className="space-y-6 border-t bg-gray-50 p-5 sm:p-6">
                      <section>
                        <h2 className="mb-4 font-semibold">Purchased Products</h2>
                        <div className="space-y-4">
                          {order.items?.map((item, index) => (
                            <div key={item.product || index} className="flex items-center gap-4">
                              {item.image ? <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl border bg-white object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-xl border bg-white"><Package size={22} /></span>}
                              <div className="min-w-0 flex-1"><p className="font-medium text-gray-800">{item.name}</p><p className="text-sm text-gray-500">Quantity: {item.quantity}</p></div>
                              <p className="whitespace-nowrap font-semibold">{currency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h2 className="mb-3 flex items-center gap-2 font-semibold"><MapPin size={18} /> Shipping Address</h2>
                        <address className="rounded-xl border bg-white p-4 text-sm not-italic text-gray-600">
                          {[
                            order.shippingAddress?.street,
                            order.shippingAddress?.city,
                            order.shippingAddress?.state,
                            order.shippingAddress?.postalCode,
                            order.shippingAddress?.country,
                          ].filter(Boolean).join(', ') || 'No shipping address provided.'}
                        </address>
                      </section>

                      <section className="space-y-3 rounded-xl border bg-white p-4 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium">{order.paymentMethod === 'ONLINE' ? 'Razorpay' : 'Cash on Delivery'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Payment Status</span><span className="font-medium">{order.paymentStatus}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{currency(order.subtotal ?? (order.totalAmount + (order.discountAmount || 0)))}</span></div>
                        {order.couponCode && <div className="flex justify-between"><span className="text-gray-500">Coupon ({order.couponCode})</span><span className="text-green-600">− {currency(order.discountAmount)}</span></div>}
                        <div className="flex justify-between border-t pt-3"><span className="font-semibold">Total</span><span className="font-bold">{currency(order.totalAmount)}</span></div>
                      </section>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default MyOrders
