import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
  Package,
  Truck,
} from 'lucide-react'
import { cancelMyOrder, fetchMyOrderById } from '../services/orderService'
import toast from 'react-hot-toast'

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(value) || 0)

const steps = [
  { status: 'PENDING', label: 'Order Placed', icon: Package },
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: MapPin },
]

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      setCancelling(true)
      const result = await cancelMyOrder(order._id, 'Cancelled by customer')
      setOrder(result.order)
      toast.success('Order cancelled successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => {
    let active = true

    const loadOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await fetchMyOrderById(id)
        if (active) setOrder(result)
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to find this order.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrder()
    return () => { active = false }
  }, [id])

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="animate-spin text-blue-600" size={36} /><span className="sr-only">Loading order details</span></div>
  }

  if (error || !order) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <Package size={48} className="mb-4 text-gray-300" />
        <h1 className="text-xl font-bold">Order not found</h1>
        <p className="mt-2 text-gray-500">{error || 'This order could not be found.'}</p>
        <Link to="/my-orders" className="mt-5 text-blue-600 hover:underline">Back to My Orders</Link>
      </main>
    )
  }

  const currentStep = steps.findIndex((step) => step.status === order.orderStatus)
  const cancelled = order.orderStatus === 'CANCELLED'
  const address = order.shippingAddress || {}

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/my-orders" className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <ArrowLeft size={18} /> Back to My Orders
        </Link>

        <header className="mb-6 rounded-2xl border bg-white p-6 sm:p-8">
          <p className="text-sm text-gray-500">ORDER DETAILS</p>
          <h1 className="mt-1 break-all text-2xl font-bold">#{order._id}</h1>
          <p className="mt-2 text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
          <span className={`mt-5 inline-block rounded-full px-4 py-2 text-sm font-bold ${cancelled ? 'bg-red-100 text-red-700' : order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {order.orderStatus}
          </span>
          {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && order.paymentStatus !== 'PAID' && (
            <div>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling || (order.paymentMethod === 'ONLINE' && Boolean(order.razorpayOrderId))}
                className="mt-5 rounded-xl border border-red-200 px-5 py-3 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
              {order.paymentMethod === 'ONLINE' && order.razorpayOrderId && (
                <p className="mt-2 text-sm text-gray-500">Online payment is awaiting reconciliation; cancellation is temporarily unavailable.</p>
              )}
            </div>
          )}
        </header>

        <section className="mb-6 rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold">Order Tracking</h2>
          {cancelled ? (
            <p className="font-semibold text-red-600">This order has been cancelled.</p>
          ) : (
            <ol className="space-y-5">
              {steps.map((step, index) => {
                const complete = currentStep >= index
                const Icon = step.icon
                return (
                  <li key={step.status} className="flex items-center gap-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${complete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {complete ? <Icon size={20} /> : <Circle size={20} />}
                    </span>
                    <div>
                      <p className={`font-semibold ${complete ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      <p className="text-xs text-gray-400">{complete ? 'Completed' : 'Awaiting update'}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section className="mb-6 rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold">Purchased Products</h2>
          <div className="space-y-5">
            {order.items?.map((item, index) => (
              <div key={item.product || index} className="flex items-center gap-4">
                {item.image ? <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl bg-gray-100 object-cover" /> : <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100"><Package className="text-gray-400" /></span>}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">{currency(item.price)} × {item.quantity}</p>
                </div>
                <p className="whitespace-nowrap font-bold">{currency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-bold">Shipping Address</h2>
          <p className="font-semibold">{order.customerName}</p>
          {[address.street, [address.city, address.state].filter(Boolean).join(', '), address.postalCode, address.country || 'India'].filter(Boolean).map((line, index) => <p key={index} className="mt-1 text-gray-600">{line}</p>)}
        </section>

        <section className="rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold">Payment Summary</h2>
          {order.lastPaymentFailure?.at && order.paymentStatus !== 'PAID' && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Most recent payment attempt failed</p>
              {order.lastPaymentFailure.description && <p className="mt-1">{order.lastPaymentFailure.description}</p>}
            </div>
          )}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{currency(order.subtotal ?? (order.totalAmount + (order.discountAmount || 0)))}</span></div>
            {order.couponCode && <div className="flex justify-between"><span className="text-gray-500">Coupon ({order.couponCode})</span><span className="text-green-600">− {currency(order.discountAmount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span>{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Status</span><span className="font-semibold">{order.paymentStatus}</span></div>
            {order.razorpayPaymentId && <div className="flex justify-between gap-4"><span className="text-gray-500">Razorpay Payment ID</span><span className="break-all text-right">{order.razorpayPaymentId}</span></div>}
            <div className="flex justify-between border-t pt-4 text-lg font-bold"><span>Total Due</span><span>{currency(order.totalAmount)}</span></div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrderDetails
