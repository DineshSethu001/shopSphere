
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Tag, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { clearCart } from '../redux/cartSlice'
import { createOrder } from '../services/orderService'
import { validateCoupon } from '../services/couponService'
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/paymentService'

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true)
    return
  }

  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => resolve(true)
  script.onerror = () => resolve(false)
  document.body.appendChild(script)
})

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0)

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  const activeCoupon = appliedCoupon?.subtotal === subtotal ? appliedCoupon : null
  const discount = activeCoupon?.discount || 0
  const finalAmount = Math.max(0, subtotal - discount)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code.')
      return
    }

    try {
      setCouponLoading(true)
      const result = await validateCoupon(couponCode.trim(), subtotal)
      setAppliedCoupon({ code: result.coupon.code, discount: result.discount, subtotal })
      toast.success('Coupon applied!')
    } catch (err) {
      setAppliedCoupon(null)
      toast.error(err.response?.data?.message || 'Invalid coupon.')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
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
        phone: form.phone,
        couponCode: activeCoupon?.code || '',

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

        paymentMethod,
      }

      const response = await createOrder(orderData)

      if (paymentMethod === 'COD') {
        dispatch(clearCart())
        navigate('/order-success', { state: { order: response.order } })
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        throw new Error('Unable to load Razorpay Checkout. Your order remains pending.')
      }

      const gatewayOrder = await createRazorpayOrder(response.order._id)
      const options = {
        key: gatewayOrder.keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        name: 'ShopSphere',
        description: `Payment for order ${response.order._id}`,
        order_id: gatewayOrder.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: form.phone,
        },
        theme: { color: '#2563EB' },
        handler: async (paymentResponse) => {
          try {
            const verification = await verifyRazorpayPayment({
              ...paymentResponse,
              shopSphereOrderId: response.order._id,
            })
            if (verification.success) {
              dispatch(clearCart())
              toast.success('Payment successful!')
              navigate('/order-success', { state: { order: verification.order } })
            }
          } catch (verifyError) {
            const message = verifyError.response?.data?.message || 'Payment verification failed. Contact support if money was deducted.'
            setError(message)
            toast.error(message)
          }
        },
        modal: {
          ondismiss: () => toast('Payment window closed. Your order is still pending.'),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (paymentFailure) => {
        toast.error(paymentFailure.error?.description || 'Payment failed. Please try again.')
      })
      razorpay.open()

    } catch (err) {
      const message = err.response?.data?.message || err.message ||
        'Unable to place your order. Please try again.'
      setError(
        message
      )
      toast.error(message)
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
                readOnly
                aria-label="Account name"
                className="rounded-lg border bg-gray-50 p-3 text-gray-600"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                readOnly
                aria-label="Account email"
                className="rounded-lg border bg-gray-50 p-3 text-gray-600"
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

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
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

            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border p-4">
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === 'ONLINE'}
                onChange={() => setPaymentMethod('ONLINE')}
              />
              <div>
                <p className="font-semibold">Pay Online with Razorpay</p>
                <p className="text-sm text-gray-500">UPI, cards and net banking.</p>
              </div>
            </label>

          </div>

          {/* Coupon */}
          <div className="rounded-2xl border bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Tag size={19} /> Apply Coupon
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                disabled={Boolean(activeCoupon)}
                className="min-w-0 flex-1 rounded-xl border px-4 py-3 uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || Boolean(activeCoupon)}
                className="rounded-xl bg-blue-600 px-4 text-white disabled:opacity-50"
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>
            {activeCoupon && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 p-3 text-green-700">
                <div>
                  <p className="font-semibold">{activeCoupon.code} applied</p>
                  <p className="text-sm">You saved {currency(activeCoupon.discount)}</p>
                </div>
                <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="rounded-lg p-2 hover:bg-green-100">
                  <X size={19} />
                </button>
              </div>
            )}
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

            <div className="mt-5 space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {currency(discount)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Total</span>
                <span>{currency(finalAmount)}</span>
              </div>
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
            {loading ? 'Processing...' : paymentMethod === 'ONLINE' ? 'Continue to Payment' : 'Place Order'}
          </button>

        </form>

      </div>
    </section>
  )
}

export default Checkout
