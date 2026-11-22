

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ShoppingCart } from 'lucide-react'
import { addToCart } from '../redux/cartSlice'
import { fetchProductById } from '../services/productService'

const ProductDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadProduct = async () => {
      setLoading(true)
      setError('')
      setProduct(null)

      try {
        const data = await fetchProductById(id)

        if (active) {
          setProduct(data)
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            'Unable to load product'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <p className="p-10 text-center">Loading product...</p>
  }

  if (error || !product) {
    return (
      <div className="p-10 text-center text-red-500">
        {error || 'Product not found'}
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
      })
    )
  }

  return (
    <section className="grid gap-10 px-6 py-12 md:grid-cols-2 md:px-12">

      <div className="overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full max-h-[500px] w-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-center">

        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
          {product.category}
        </p>

        <h1 className="text-3xl font-bold md:text-4xl">
          {product.name}
        </h1>

        <p className="mt-5 text-2xl font-bold">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        <p className="mt-5 leading-7 text-gray-600">
          {product.description}
        </p>

        <p className="mt-5 text-sm">
          Available stock: {product.stock}
        </p>

        <div className="mt-8 flex items-center gap-5">

          <div className="flex items-center rounded-lg border">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-4 py-2"
            >
              -
            </button>

            <span className="px-3">{quantity}</span>

            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
              className="px-4 py-2"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={18} />
            {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          </button>

        </div>

      </div>
    </section>
  )
}

export default ProductDetails
