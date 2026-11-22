
import { useEffect, useState } from 'react'
import {
  Package,
  Layers,
  Wallet,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { fetchProducts } from '../services/productService'

const AdminDashboard = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load dashboard data'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Dashboard calculations
  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  )

  const inventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.stock || 0),
    0
  )

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  )

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Inventory Units',
      value: totalStock,
      icon: Layers,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Inventory Value',
      value: `₹${inventoryValue.toLocaleString('en-IN')}`,
      icon: Wallet,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-10 md:px-10">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome to ShopSphere Admin Panel.
          </p>
        </div>

        <Link
          to="/admin/products"
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800"
        >
          <Package size={18} />
          Manage Products
        </Link>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={24} />
                </div>

              </div>
            </div>
          )
        })}

      </div>

      {/* Low stock section */}
      <div className="mt-10 rounded-xl bg-white shadow-sm">

        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-xl font-bold">
              Low Stock Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Products with 5 or fewer units remaining.
            </p>
          </div>

          <AlertTriangle className="text-orange-500" />

        </div>

        {lowStockProducts.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            Great! No low-stock products.
          </p>
        ) : (
          <div className="divide-y">

            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 p-5"
              >

                <div className="flex items-center gap-3">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />

                  <div>
                    <p className="font-semibold">
                      {product.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {product.category}
                    </p>
                  </div>

                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  {product.stock} left
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Quick actions */}
      <div className="mt-10">

        <h2 className="mb-5 text-xl font-bold">
          Quick Actions
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <Link
            to="/admin/products"
            className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <Package className="text-blue-600" size={28} />

              <div>
                <h3 className="font-bold">Manage Products</h3>
                <p className="text-sm text-gray-500">
                  Add, edit and delete products.
                </p>
              </div>
            </div>

            <ArrowRight />
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <ShoppingBag className="text-green-600" size={28} />

              <div>
                <h3 className="font-bold">View Store</h3>
                <p className="text-sm text-gray-500">
                  Visit your customer storefront.
                </p>
              </div>
            </div>

            <ArrowRight />
          </Link>
<Link
  to="/admin/orders"
  className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm hover:shadow-md"
>
  <div className="flex items-center gap-4">
    <ShoppingBag className="text-purple-600" size={28} />

    <div>
      <h3 className="font-bold">Manage Orders</h3>
      <p className="text-sm text-gray-500">
        View orders and update delivery status.
      </p>
    </div>
  </div>

  <ArrowRight />
</Link>
        </div>

      </div>

    </section>
  )
}

export default AdminDashboard
