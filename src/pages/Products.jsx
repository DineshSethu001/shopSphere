import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import useProducts from '../hooks/useProducts'
import { fetchProductCategories } from '../services/productService'
import SEO from '../components/SEO'

function Products() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    fetchProductCategories()
      .then((data) => {
        if (active) setCategories(data)
      })
      .catch(() => {
        if (active) setCategoryError('Could not load categories.')
      })
    return () => { active = false }
  }, [])

  const { products, pagination, loading, error } = useProducts({
    search: debouncedSearch,
    category,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  })

  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setSort('newest')
    setPage(1)
  }

  const handlePriceChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const totalPages = pagination?.totalPages || 0

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <SEO
        title="Shop All Products"
        description="Browse and filter ShopSphere products by category, price, popularity and more."
        keywords={['ShopSphere products', 'shop online', 'product catalog']}
      />
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600">SHOPSPHERE COLLECTION</p>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Explore Products</h1>
          <p className="mt-2 text-gray-500">Find the products you love at great prices.</p>
        </header>

        <label className="relative mb-6 block">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name or description..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          )}
        </label>

        <section aria-label="Product filters and sorting" className="mb-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold text-gray-800"><SlidersHorizontal size={19} /> Filters & Sorting</h2>
            <button type="button" onClick={resetFilters} className="text-sm text-blue-600 hover:underline">Clear all</button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-gray-600">
              Category
              <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="mt-2 w-full rounded-xl border bg-white px-3 py-3">
                <option value="">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {categoryError && <span className="mt-1 block text-xs text-red-500">{categoryError}</span>}
            </label>

            <label className="text-sm font-medium text-gray-600">
              Minimum Price (₹)
              <input type="number" min="0" value={minPrice} onChange={handlePriceChange(setMinPrice)} placeholder="Min price" className="mt-2 w-full rounded-xl border px-3 py-3" />
            </label>

            <label className="text-sm font-medium text-gray-600">
              Maximum Price (₹)
              <input type="number" min="0" value={maxPrice} onChange={handlePriceChange(setMaxPrice)} placeholder="Max price" className="mt-2 w-full rounded-xl border px-3 py-3" />
            </label>

            <label className="text-sm font-medium text-gray-600">
              Sort By
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="mt-2 w-full rounded-xl border bg-white px-3 py-3">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="rating">Top Rated</option>
              </select>
            </label>
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Products</h2>
            {!loading && <p className="mt-1 text-sm text-gray-500">{pagination?.totalProducts || 0} products found</p>}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20" role="status">
            <Loader2 size={36} className="mb-3 animate-spin text-blue-600" />
            <p className="text-gray-500">Finding your products...</p>
          </div>
        )}

        {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-700" role="alert">{error}</div>}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border bg-white px-5 py-16 text-center">
            <Search size={40} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800">No products found</h3>
            <p className="mb-5 mt-2 text-gray-500">Try changing your search or filters.</p>
            <button type="button" onClick={resetFilters} className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Clear Filters</button>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <nav aria-label="Product pages" className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={!pagination?.hasPreviousPage} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-white disabled:opacity-40">
              <ChevronLeft size={18} /> Previous
            </button>
            <span className="px-3 text-sm text-gray-600">Page {pagination.currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={!pagination?.hasNextPage} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-white disabled:opacity-40">
              Next <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </div>
    </main>
  )
}

export default Products
