
import { useEffect, useState } from 'react'
import {
  Package,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'

import {
  fetchOrders,
  updateOrderStatus,
} from '../services/orderService'

const statuses = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
]

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await fetchOrders()
      setOrders(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)
      setError('')
      setMessage('')

      const updatedOrder = await updateOrderStatus(
        orderId,
        newStatus
      )

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      )

      setMessage('Order status updated successfully!')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update order status.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const statusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }

    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-10 md:px-10">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order Management
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage customer orders.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh Orders
        </button>

      </div>

      {/* Notifications */}
      {message && (
        <p className="mb-5 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[
          ['Total Orders', orders.length],
          ['Pending', orders.filter(o => o.orderStatus === 'PENDING').length],
          ['Shipped', orders.filter(o => o.orderStatus === 'SHIPPED').length],
          ['Delivered', orders.filter(o => o.orderStatus === 'DELIVERED').length],
        ].map(([title, value]) => (
          <div key={title} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="mt-2 text-2xl font-bold">{value}</h2>
          </div>
        ))}

      </div>

      {/* Orders */}
      <div className="space-y-5">

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center">
            <ShoppingBag className="mx-auto mb-3 text-gray-400" size={40} />
            <h2 className="text-xl font-bold">No orders yet</h2>
            <p className="mt-2 text-gray-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >

              {/* Order header */}
              <div className="flex flex-col justify-between gap-4 border-b p-5 md:flex-row md:items-center">

                <div>
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>

                  <p className="break-all font-semibold">
                    {order._id}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>

                  <select
                    value={order.orderStatus}
                    disabled={
                      updatingId === order._id ||
                      order.orderStatus === 'CANCELLED'
                    }
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="rounded-lg border p-2 text-sm disabled:opacity-50"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}

                    {order.orderStatus === 'CANCELLED' && (
                      <option value="CANCELLED">CANCELLED</option>
                    )}
                  </select>

                </div>
              </div>

              {/* Customer details */}
              <div className="grid gap-6 p-5 md:grid-cols-2">

                <div>
                  <h3 className="mb-3 font-bold">
                    Customer Details
                  </h3>

                  <p className="text-sm text-gray-600">
                    {order.customerName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.email}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.phone}
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 font-bold">
                    Delivery Address
                  </h3>

                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.street}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.city},
                    {' '}{order.shippingAddress?.state}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.postalCode},
                    {' '}{order.shippingAddress?.country}
                  </p>
                </div>

              </div>

              {/* Order items */}
              <div className="border-t p-5">

                <h3 className="mb-4 font-bold">
                  Ordered Products
                </h3>

                <div className="space-y-4">

                  {order.items?.map((item, index) => (
                    <div
                      key={`${order._id}-${item.product}-${index}`}
                      className="flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center gap-3">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <Package size={20} />
                          </div>
                        )}

                        <div>
                          <p className="font-medium">
                            {item.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                          </p>
                        </div>

                      </div>

                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>

                    </div>
                  ))}

                </div>

              </div>

              {/* Payment and total */}
              <div className="flex flex-col justify-between gap-3 border-t bg-gray-50 p-5 sm:flex-row sm:items-center">

                <div>
                  <p className="text-sm text-gray-500">
                    Payment: {order.paymentMethod}
                  </p>

                  <p className="text-sm text-gray-500">
                    Payment status: {order.paymentStatus}
                  </p>
                </div>

                <div className="text-xl font-bold">
                  Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                </div>

              </div>

            </article>
          ))
        )}

      </div>

    </section>
  )
}

export default AdminOrders
