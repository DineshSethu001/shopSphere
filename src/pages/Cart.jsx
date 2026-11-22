
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from '../redux/cartSlice'

import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react'
import { getOptimizedImageUrl } from '../services/optimizedImage'

function Cart() {
  const dispatch = useDispatch()

  const items = useSelector(
    (state) => state.cart.items
  )

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const totalPrice = items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  )

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <ShoppingBag size={65} className="text-gray-300" />

        <h2 className="text-2xl font-bold mt-5">
          Your cart is empty
        </h2>

        <p className="text-gray-500 mt-2">
          Start adding your favourite products!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-bold mb-8">
        Shopping Cart ({totalItems})
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-5">

          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-5 border rounded-xl p-4"
            >

              <img
                src={getOptimizedImageUrl(item.image, 300)}
                alt={item.name}
                width="128"
                height="128"
                loading="lazy"
                decoding="async"
                className="w-full sm:w-32 h-32 object-cover rounded-lg"
              />

              <div className="flex-1">

                <h3 className="font-semibold text-lg">
                  {item.name}
                </h3>

                <p className="font-bold mt-2">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>

                <div className="flex items-center gap-4 mt-5">

                  <button
                    onClick={() =>
                      dispatch(decreaseQuantity(item.id))
                    }
                    className="border rounded p-2"
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      dispatch(increaseQuantity(item.id))
                    }
                    className="border rounded p-2"
                  >
                    <Plus size={16} />
                  </button>

                </div>

              </div>

              <div className="flex flex-row sm:flex-col justify-between items-center">

                <p className="font-bold">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>

                <button
                  onClick={() =>
                    dispatch(removeFromCart(item.id))
                  }
                  className="text-red-500"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={20} />
                </button>

              </div>
            </div>
          ))}

          <button
            onClick={() => dispatch(clearCart())}
            className="text-red-500 font-semibold text-sm"
          >
            Clear Cart
          </button>

        </div>

        {/* Order Summary */}
        <div className="border rounded-xl p-6 h-fit">

          <h2 className="text-xl font-bold mb-6">
            Order Summary
          </h2>

          <div className="flex justify-between mb-4">
            <span className="text-gray-500">
              Total Items
            </span>

            <span>{totalItems}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-500">
              Subtotal
            </span>

            <span>
              ₹{totalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-500">
              Shipping
            </span>

            <span className="text-green-600">
              Free
            </span>
          </div>

          <hr className="my-5" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>

            <span>
              ₹{totalPrice.toLocaleString('en-IN')}
            </span>
          </div>

       <Link
  to="/checkout"
  className="block w-full rounded-lg bg-black px-6 py-3 text-center font-semibold text-white hover:bg-gray-800"
>
  Proceed to Checkout
</Link>
        </div>

      </div>
    </div>
  )
}

export default Cart
