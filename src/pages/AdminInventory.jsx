import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Loader2,
  Minus,
  Package,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchInventory, updateProductStock } from '../services/inventoryService'

function AdminInventory() {
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [quantities, setQuantities] = useState({})

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchInventory()
      setProducts(data.products || [])
      setSummary(data.summary || {})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load inventory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInventory() }, [loadInventory])

  const handleAdjustment = async (product, direction) => {
    const amount = Number(quantities[product._id] ?? 1)
    if (!Number.isSafeInteger(amount) || amount < 1) {
      toast.error('Enter a valid whole-number quantity.')
      return
    }
    const adjustment = direction * amount
    if (product.stock + adjustment < 0) {
      toast.error('Stock cannot go below zero.')
      return
    }

    try {
      setUpdatingId(product._id)
      const updated = await updateProductStock(product._id, { adjustment })
      setProducts((current) => current.map((item) => item._id === product._id
        ? { ...item, stock: updated.stock }
        : item))
      setQuantities((current) => ({ ...current, [product._id]: 1 }))
      toast.success('Inventory updated.')
      await loadInventory()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Stock update failed.')
    } finally {
      setUpdatingId(null)
    }
  }

  const stockStatus = (stock) => stock === 0 ? 'Out of stock' : stock <= 5 ? 'Low stock' : 'In stock'
  const stockStyle = (stock) => stock === 0
    ? 'bg-red-100 text-red-700'
    : stock <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-2 text-gray-500">Monitor product stock and manage quantities.</p>
          </div>
          <button onClick={loadInventory} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 hover:bg-gray-100 disabled:opacity-50">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </header>

        <section aria-label="Inventory summary" className="mb-8 grid gap-5 sm:grid-cols-3">
          <SummaryCard icon={Package} label="Total Products" value={summary.totalProducts} tone="text-blue-600" />
          <SummaryCard icon={AlertTriangle} label="Low Stock" value={summary.lowStockCount} tone="text-yellow-600" />
          <SummaryCard icon={XCircle} label="Out of Stock" value={summary.outOfStockCount} tone="text-red-600" />
        </section>

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-6"><h2 className="text-lg font-bold">Product Inventory</h2></div>
          {loading ? (
            <div className="flex justify-center py-16" role="status"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="sr-only">Loading inventory</span></div>
          ) : products.length === 0 ? (
            <p className="py-16 text-center text-gray-500">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4">Adjust Stock</th></tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-t">
                      <td className="p-4">
                        <div className="flex min-w-48 items-center gap-3">
                          {product.image ? <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg bg-gray-100 object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100"><Package className="text-gray-400" /></span>}
                          <div><p className="font-semibold text-gray-800">{product.name}</p>{!product.isActive && <p className="text-xs text-gray-400">Inactive product</p>}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{product.category}</td>
                      <td className="p-4 font-bold">{product.stock}</td>
                      <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockStyle(product.stock)}`}>{stockStatus(product.stock)}</span></td>
                      <td className="p-4">
                        <div className="flex min-w-52 items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            aria-label={`Adjustment quantity for ${product.name}`}
                            value={quantities[product._id] ?? 1}
                            onChange={(event) => setQuantities((current) => ({ ...current, [product._id]: event.target.value }))}
                            className="w-16 rounded-lg border px-2 py-2"
                          />
                          <button onClick={() => handleAdjustment(product, 1)} disabled={updatingId === product._id} title="Add stock" className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-50">
                            {updatingId === product._id ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                          </button>
                          <button onClick={() => handleAdjustment(product, -1)} disabled={updatingId === product._id || product.stock === 0} title="Remove stock" className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"><Minus size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <article className="rounded-2xl border bg-white p-6">
      <Icon className={`${tone} mb-3`} size={26} />
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value || 0}</p>
    </article>
  )
}

export default AdminInventory
