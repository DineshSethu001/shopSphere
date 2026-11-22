
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { clearCart } from '../redux/cartSlice'
import { createOrder } from '../services/orderService'

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setError('Your cart is empty.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const orderData = {
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,

        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: 'India',
        },

        items: cartItems.map((item) => ({
          productId: item._id || item.id,
          quantity: item.quantity,
        })),

        paymentMethod: 'COD',
      }

      const response = await createOrder(orderData)

      dispatch(clearCart())

      navigate('/order-success', {
        state: {
          order: response.order,
        },
      })

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to place your order. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5">
        <h2 className="text-2xl font-bold">
          Your cart is empty
        </h2>

        <Link
          to="/products"
          className="mt-5 rounded-lg bg-black px-6 py-3 text-white"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-12">

      <div className="mx-auto max-w-4xl">

        <h1 className="mb-2 text-3xl font-bold">
          Checkout
        </h1>

        <p className="mb-8 text-gray-500">
          Complete your delivery information.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Customer details */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-bold">
              Customer Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Full name"
                required
                maxLength={100}
                className="rounded-lg border p-3"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                maxLength={254}
                className="rounded-lg border p-3"
              />

              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
                className="rounded-lg border p-3 md:col-span-2"
              />

            </div>
          </div>

          {/* Shipping details */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-bold">
              Delivery Address
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Street address"
                required
                className="rounded-lg border p-3 md:col-span-2"
              />

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="rounded-lg border p-3"
              />

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                required
                className="rounded-lg border p-3"
              />

              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="PIN code"
                required
                pattern="[0-9]{6}"
                title="Enter a 6-digit PIN code"
                className="rounded-lg border p-3"
              />

            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-xl font-bold">
              Payment Method
            </h2>

            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="radio"
                checked
                readOnly
              />

              <div>
                <p className="font-semibold">
                  Cash on Delivery
                </p>

                <p className="text-sm text-gray-500">
                  Pay when your order arrives.
                </p>
              </div>
            </label>

          </div>

          {/* Order summary */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-bold">
              Order Summary
            </h2>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 border-b py-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}

            <div className="mt-5 flex justify-between text-lg font-bold">
              <span>Estimated Total</span>

              <span>
                ₹{cartItems.reduce(
                  (total, item) =>
                    total + item.price * item.quantity,
                  0
                ).toLocaleString('en-IN')}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Final amount is calculated and validated by the server.
            </p>

          </div>

          {error && (
            <p className="rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>

        </form>

      </div>
    </section>
  )
}

export default Checkout
