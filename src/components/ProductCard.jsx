
import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Plus, Minus, Heart, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
} from '../redux/cartSlice'
import { addWishlistItem } from '../services/wishlistService'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../services/optimizedImage'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  const [isSaved, setIsSaved] = useState(false)
  const [savingWishlist, setSavingWishlist] = useState(false)

  const cartItem = useSelector(state =>
    state.cart.items.find(
      item => item.id === product.id
    )
  )

  const handleWishlist = async () => {
    if (isSaved || savingWishlist) return

    try {
      setSavingWishlist(true)
      await addWishlistItem(product.id)
      setIsSaved(true)
      toast.success('Added to wishlist!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add to wishlist. Please log in.')
    } finally {
      setSavingWishlist(false)
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition">

      <div className="relative">
        <img
          src={getOptimizedImageUrl(product.image, 420)}
          srcSet={getOptimizedImageSrcSet(product.image)}
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          alt={product.name}
          width="420"
          height="208"
          loading="lazy"
          decoding="async"
          className="h-52 w-full object-cover"
        />
        <button
          type="button"
          onClick={handleWishlist}
          disabled={savingWishlist}
          aria-label={isSaved ? 'Added to wishlist' : 'Add to wishlist'}
          aria-pressed={isSaved}
          title={isSaved ? 'Saved to wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow transition hover:text-red-500 disabled:opacity-60"
        >
          <Heart
            size={20}
            className={isSaved ? 'text-red-500' : 'text-gray-500'}
            fill={isSaved ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="p-4">

        <p className="text-xs text-orange-500 font-semibold">
          {product.category}
        </p>

        <h3 className="font-semibold mt-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="flex items-center gap-1 text-yellow-500">
            <Star size={15} fill="currentColor" />
            <span className="text-sm font-semibold text-gray-700">
              {Number(product.rating || 0).toFixed(1)}
            </span>
          </span>
          <span className="text-xs text-gray-400">({product.numReviews || 0} reviews)</span>
        </div>

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

export default memo(ProductCard)
