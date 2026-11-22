
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService'

const initialForm = {
  name: '',
  price: '',
  category: '',
  description: '',
  image: '',
  stock: '',
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
      setError('')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load products'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(initialForm)
    setShowForm(true)
    setMessage('')
  }

  const handleEdit = (product) => {
    setEditingId(product.id)

    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      stock: String(product.stock),
    })

    setShowForm(true)
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      if (editingId) {
        await updateProduct(editingId, productData)
        setMessage('Product updated successfully!')
      } else {
        await createProduct(productData)
        setMessage('Product added successfully!')
      }

      setForm(initialForm)
      setEditingId(null)
      setShowForm(false)

      await loadProducts()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save product'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      await deleteProduct(id)

      setMessage('Product deleted successfully!')
      await loadProducts()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete product'
      )
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-10 md:px-10">
<Link
  to="/admin/products/add"
  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
>
  <Plus size={18} />
  Add New Product
</Link>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your ShopSphere inventory.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {/* Notifications */}
      {message && (
        <p className="mb-5 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {/* Product form */}
      {showForm && (
        <div className="mb-10 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <X />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock quantity"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="Product image URL"
              className="rounded-lg border p-3 md:col-span-2"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description"
              rows="4"
              className="rounded-lg border p-3 md:col-span-2"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:opacity-50 md:col-span-2"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Product'
                  : 'Create Product'}
            </button>

          </form>
        </div>
      )}

      {/* Product list */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b p-5">
          <h2 className="text-lg font-bold">
            All Products ({products.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-10 text-center">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="p-10 text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] text-left">

              <thead className="bg-gray-100 text-sm text-gray-600">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />

                        <span className="font-medium">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {product.category}
                    </td>

                    <td className="p-4 font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      {product.stock}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-3">

                        <button
                          onClick={() => handleEdit(product)}
                          title="Edit product"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          title="Delete product"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </section>
  )
}

export default AdminProducts
