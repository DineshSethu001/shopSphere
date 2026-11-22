
import { Link, useLocation, Navigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

const OrderSuccess = () => {
  const location = useLocation()
  const order = location.state?.order

  // Prevent opening the page without an order confirmation
  if (!order) {
    return <Navigate to="/products" replace />
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-5">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">

        <CheckCircle
          size={70}
          className="mx-auto text-green-500"
        />

        <h1 className="mt-5 text-3xl font-bold">
          Order Placed!
        </h1>

        <p className="mt-3 text-gray-500">
          Thank you for shopping with ShopSphere.
          Your order has been received.
        </p>

        <div className="my-8 rounded-xl bg-gray-50 p-5 text-left">

          <div className="flex justify-between py-2">
            <span className="text-gray-500">Order ID</span>

            <span className="font-semibold">
              {order._id}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-500">Total Amount</span>

            <span className="font-bold">
              ₹{order.totalAmount?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-500">Payment</span>

            <span className="font-semibold">
              Cash on Delivery
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-500">Status</span>

            <span className="font-semibold text-orange-600">
              {order.orderStatus}
            </span>
          </div>

        </div>

        <Link
          to="/products"
          className="block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
<Link
  to="/track-order"
  className="mt-3 block rounded-lg border border-black px-6 py-3 font-semibold text-black hover:bg-gray-100"
>
  Track Your Order
</Link>
      </div>

    </section>
  )
}

export default OrderSuccess
