
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Plus, Minus } from 'lucide-react'

import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
} from '../redux/cartSlice'

function ProductCard({ product }) {
  const dispatch = useDispatch()

  const cartItem = useSelector(state =>
    state.cart.items.find(
      item => item.id === product.id
    )
  )

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition">

      <img
        src={product.image}
        alt={product.name}
        className="w-full h-52 object-cover"
      />

      <div className="p-4">

        <p className="text-xs text-orange-500 font-semibold">
          {product.category}
        </p>

        <h3 className="font-semibold mt-2">
          {product.name}
        </h3>

        <p className="font-bold text-lg mt-2">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        {!cartItem ? (

          <button
            onClick={() =>
              dispatch(addToCart({
                product,
                quantity: 1,
              }))
            }
            className="mt-4 w-full bg-black text-white py-3 rounded-lg hover:bg-orange-500 transition"
          >
            <ShoppingCart size={17} className="inline mr-2" />
            Add to Cart
          </button>

        ) : (

          <div className="mt-4 flex items-center justify-between border rounded-lg p-2">

            <button
              onClick={() =>
                dispatch(decreaseQuantity(product.id))
              }
            >
              <Minus size={18} />
            </button>

            <span className="font-bold">
              {cartItem.quantity}
            </span>

            <button
              onClick={() =>
                dispatch(increaseQuantity(product.id))
              }
            >
              <Plus size={18} />
            </button>

          </div>

        )}

      </div>
    </div>
  )
}

export default ProductCard
