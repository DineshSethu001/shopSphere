
import { useState } from 'react'
import { Package, Search, MapPin, CheckCircle } from 'lucide-react'
import { trackOrder } from '../services/orderService'

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')
      setOrder(null)

      const result = await trackOrder(orderId.trim(), email.trim())

      setOrder(result)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to find your order.'
      )
    } finally {
      setLoading(false)
    }
  }

  const currentStep = steps.indexOf(order?.orderStatus)

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-12">

      <div className="mx-auto max-w-3xl">

        <div className="mb-8 text-center">
          <Package size={45} className="mx-auto text-gray-800" />

          <h1 className="mt-4 text-3xl font-bold">
            Track Your Order
          </h1>

          <p className="mt-2 text-gray-500">
            Enter your order ID and email to see your delivery status.
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >

          <div className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Order ID
              </label>

              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your MongoDB order ID"
                required
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your order email"
                required
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
              />
            </div>

          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-black p-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Search size={18} />
            {loading ? 'Searching...' : 'Track Order'}
          </button>

        </form>

        {/* Order details */}
        {order && (
          <div className="mt-8 space-y-6">

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>

                  <p className="break-all font-semibold">
                    {order._id}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                  {order.orderStatus}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Order Date
                  </p>

                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <p className="font-bold">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

            </div>

            {/* Delivery progress */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold">
                Delivery Progress
              </h2>

              {order.orderStatus === 'CANCELLED' ? (
                <p className="rounded-lg bg-red-100 p-4 font-semibold text-red-700">
                  This order has been cancelled.
                </p>
              ) : (
                <div className="space-y-5">

                  {steps.map((step, index) => {
                    const completed =
                      currentStep >= 0 && index <= currentStep

                    return (
                      <div
                        key={step}
                        className="flex items-center gap-4"
                      >
                        <CheckCircle
                          size={24}
                          className={
                            completed
                              ? 'text-green-600'
                              : 'text-gray-300'
                          }
                        />

                        <div>
                          <p className={`font-semibold ${
                            completed ? 'text-green-700' : 'text-gray-400'
                          }`}>
                            {step}
                          </p>

                          <p className="text-xs text-gray-500">
                            {index === 0 && 'Your order has been received.'}
                            {index === 1 && 'Your order has been confirmed.'}
                            {index === 2 && 'Your order is on its way.'}
                            {index === 3 && 'Your order has been delivered.'}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                </div>
              )}

            </div>

            {/* Ordered products */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-bold">
                Ordered Products
              </h2>

              {order.items.map((item, index) => (
                <div
                  key={`${item.product}-${index}`}
                  className="flex items-center justify-between gap-3 border-b py-4 last:border-0"
                >

                  <div className="flex items-center gap-3">

                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    )}

                    <div>
                      <p className="font-semibold">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                  </div>

                  <p className="font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>

                </div>
              ))}

            </div>

            {/* Delivery address */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

              <div className="mb-3 flex items-center gap-2">
                <MapPin size={20} />
                <h2 className="text-xl font-bold">
                  Delivery Address
                </h2>
              </div>

              <p className="text-gray-600">
                {order.shippingAddress.street}
              </p>

              <p className="text-gray-600">
                {order.shippingAddress.city},
                {' '}{order.shippingAddress.state}
              </p>

              <p className="text-gray-600">
                {order.shippingAddress.postalCode},
                {' '}{order.shippingAddress.country}
              </p>

            </div>

          </div>
        )}

      </div>
    </section>
  )
}

export default OrderTracking
