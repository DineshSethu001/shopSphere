
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import useProducts from '../hooks/useProducts'

const FeaturedProducts = () => {
  const { products, loading, error } = useProducts()

  const featuredProducts = products.slice(0, 4)

  return (
    <section className="px-6 py-16 md:px-12">

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            Featured Products
          </h2>

          <p className="mt-2 text-gray-500">
            Discover our popular collections.
          </p>
        </div>

        <Link
          to="/products"
          className="font-semibold text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <p className="py-10 text-center">Loading products...</p>
      ) : error ? (
        <p className="py-10 text-center text-red-500">{error}</p>
      ) : featuredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center">
          No featured products available.
        </p>
      )}

    </section>
  )
}

export default FeaturedProducts
