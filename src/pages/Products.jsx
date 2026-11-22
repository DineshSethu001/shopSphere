
import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import useProducts from '../hooks/useProducts'

const Products = () => {
  const { products, loading, error } = useProducts()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('default')

  // Get unique categories from MongoDB
  const categories = [
    'All',
    ...new Set(products.map((product) => product.category)),
  ]

  // Search and filter products
  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || product.category === category

    return matchesSearch && matchesCategory
  })

  // Sort products by price
  if (sort === 'low-to-high') {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.price - b.price
    )
  }

  if (sort === 'high-to-low') {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.price - a.price
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="text-lg font-semibold">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <section className="px-6 py-10 md:px-12">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Explore Our Products
        </h1>

        <p className="mt-2 text-gray-500">
          Discover quality products at great prices.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-4 py-3"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border px-4 py-3"
        >
          <option value="default">Default Sorting</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>

      </div>

      {/* Product count */}
      <p className="mb-5 text-sm text-gray-500">
        Showing {filteredProducts.length} products
      </p>

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>
      ) : (
        <div className="py-16 text-center">
          <h2 className="text-xl font-semibold">
            No products found
          </h2>

          <p className="mt-2 text-gray-500">
            Try another search or category.
          </p>
        </div>
      )}

    </section>
  )
}

export default Products
