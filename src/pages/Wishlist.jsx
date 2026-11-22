import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Heart,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { addToCart } from '../redux/cartSlice'
import { fetchWishlist, removeWishlistItem } from '../services/wishlistService'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../services/optimizedImage'

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0)

function Wishlist() {
  const dispatch = useDispatch()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setProducts(await fetchWishlist())
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load your wishlist.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId)
      await removeWishlistItem(productId)
      setProducts((current) => current.filter((product) => product.id !== productId))
      toast.success('Removed from wishlist.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove this product.')
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock < 1) {
      toast.error('This product is currently out of stock.')
      return
    }
    dispatch(addToCart({ product, quantity: 1 }))
    toast.success('Added to cart.')
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Heart size={30} className="text-red-500" fill="currentColor" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>
            <p className="mt-2 text-gray-500">Your favourite products, all in one place.</p>
          </div>
          <button onClick={loadWishlist} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 hover:bg-gray-100 disabled:opacity-50">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </header>

        <p className="mb-6 text-sm text-gray-500">{products.length} saved product(s)</p>

        {loading && products.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center" role="status">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <span className="sr-only">Loading wishlist</span>
          </div>
        ) : error && products.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="mb-4 text-red-600" role="alert">{error}</p>
            <button onClick={loadWishlist} className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Try Again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <Heart size={55} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-800">Your wishlist is empty</h2>
            <p className="mb-6 mt-2 text-gray-500">Save products you love and find them here later.</p>
            <Link to="/products" className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="relative bg-gray-100">
                  <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                    {product.image ? (
                      <img src={getOptimizedImageUrl(product.image, 500)} srcSet={getOptimizedImageSrcSet(product.image)} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" alt={product.name} width="500" height="280" loading="lazy" decoding="async" className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center"><Package size={45} className="text-gray-400" /></div>
                    )}
                  </Link>
                  <button onClick={() => handleRemove(product.id)} disabled={removingId === product.id} title="Remove from wishlist" aria-label={`Remove ${product.name} from wishlist`} className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-500 shadow hover:bg-red-50 disabled:opacity-50">
                    {removingId === product.id ? <Loader2 size={19} className="animate-spin" /> : <Trash2 size={19} />}
                  </button>
                </div>

                <div className="p-5">
                  <p className="mb-2 text-xs text-gray-500">{product.category}</p>
                  <Link to={`/products/${product.id}`} className="font-semibold text-gray-800 hover:text-blue-600">{product.name}</Link>
                  <p className="mt-3 text-lg font-bold text-gray-900">{currency(product.price)}</p>
                  <p className={`mt-2 text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </p>
                  <button onClick={() => handleAddToCart(product)} disabled={product.stock < 1} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                    <ShoppingCart size={18} />{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Wishlist
