import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Eye,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchOrders, updateOrderStatus } from '../services/orderService'

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0)

const dateFormat = (value) => new Date(value).toLocaleString('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const statusProgression = {
  PENDING: ['CONFIRMED', 'SHIPPED', 'DELIVERED'],
  CONFIRMED: ['SHIPPED', 'DELIVERED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [nextStatus, setNextStatus] = useState('')
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load orders.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch = !query ||
        (order.customerName || '').toLowerCase().includes(query) ||
        (order.email || '').toLowerCase().includes(query) ||
        (order._id || '').toLowerCase().includes(query)
      const matchesStatus = filterStatus === 'ALL' || order.orderStatus === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [orders, search, filterStatus])

  const handleStatusChange = async () => {
    if (!selectedOrder || !nextStatus) {
      toast.error('Select a new order status.')
      return
    }

    try {
      setUpdatingId(selectedOrder._id)
      const updatedOrder = await updateOrderStatus(selectedOrder._id, nextStatus)
      setOrders((current) => current.map((order) => (
        order._id === updatedOrder._id ? updatedOrder : order
      )))
      setSelectedOrder(updatedOrder)
      setNextStatus('')
      toast.success('Order status updated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const openOrder = (order) => {
    setSelectedOrder(order)
    setNextStatus('')
  }

  const totalOrderValue = orders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0
  )

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Orders Management</h1>
          <p className="mt-2 text-gray-500">View and manage ShopSphere customer orders.</p>
        </div>
        <button onClick={loadOrders} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 hover:bg-gray-100 disabled:opacity-50">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh Orders
        </button>
      </header>

      <section aria-label="Order summary" className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, tone: 'text-blue-600' },
          { label: 'Pending Orders', value: orders.filter((order) => order.orderStatus === 'PENDING').length, icon: Package, tone: 'text-yellow-600' },
          { label: 'Total Order Value', value: currency(totalOrderValue), icon: IndianRupee, tone: 'text-green-600' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border bg-white p-6 shadow-sm">
            <Icon className={`${tone} mb-3`} size={25} />
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm" aria-label="Search and filter orders">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="relative md:col-span-2">
            <span className="sr-only">Search orders</span>
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by customer, email or order ID..."
              className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label>
            <span className="sr-only">Filter by order status</span>
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Orders</option>
              {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <header className="border-b p-6">
          <h2 className="text-lg font-bold">All Orders ({filteredOrders.length})</h2>
        </header>
        {loading ? (
          <div className="flex justify-center py-16" role="status"><Loader2 size={32} className="animate-spin text-blue-600" /><span className="sr-only">Loading orders</span></div>
        ) : error && orders.length === 0 ? (
          <div className="p-8 text-center text-red-600" role="alert">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-500"><ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr><th className="p-4">Order ID</th><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t text-sm hover:bg-gray-50">
                    <td className="whitespace-nowrap p-4 font-medium text-gray-700">#{String(order._id).slice(-8).toUpperCase()}</td>
                    <td className="p-4"><p className="font-medium text-gray-800">{order.customerName}</p><p className="text-xs text-gray-500">{order.email}</p></td>
                    <td className="whitespace-nowrap p-4 text-gray-600">{dateFormat(order.createdAt)}</td>
                    <td className="whitespace-nowrap p-4 font-semibold">{currency(order.totalAmount)}</td>
                    <td className="p-4"><p className="text-xs font-medium">{order.paymentMethod}</p><p className="text-xs text-gray-500">{order.paymentStatus}</p></td>
                    <td className="p-4"><span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>{order.orderStatus}</span></td>
                    <td className="p-4"><button onClick={() => openOrder(order)} className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-800"><Eye size={17} /> View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedOrder(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="order-dialog-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <header className="flex items-center justify-between border-b p-6">
              <div><h2 id="order-dialog-title" className="text-xl font-bold">Order Details</h2><p className="mt-1 break-all text-sm text-gray-500">#{selectedOrder._id}</p></div>
              <button onClick={() => setSelectedOrder(null)} aria-label="Close order details" className="rounded-lg p-2 hover:bg-gray-100"><X size={22} /></button>
            </header>

            <div className="space-y-7 p-6">
              <section>
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><User size={19} /> Customer Information</h3>
                <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2"><User size={16} />{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-2"><Mail size={16} />{selectedOrder.email}</p>
                  <p className="flex items-center gap-2"><Phone size={16} />{selectedOrder.phone}</p>
                  <p className="flex items-center gap-2"><CalendarDays size={16} />{dateFormat(selectedOrder.createdAt)}</p>
                </div>
              </section>

              <section>
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><MapPin size={19} /> Shipping Address</h3>
                <address className="rounded-xl bg-gray-50 p-4 text-sm not-italic text-gray-600">
                  {[
                    selectedOrder.shippingAddress?.street,
                    selectedOrder.shippingAddress?.city,
                    selectedOrder.shippingAddress?.state,
                    selectedOrder.shippingAddress?.postalCode,
                    selectedOrder.shippingAddress?.country,
                  ].filter(Boolean).join(', ') || 'No shipping address provided.'}
                </address>
              </section>

              <section>
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><Package size={19} /> Ordered Products</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={item.product || index} className="flex items-center gap-4 border-b pb-4 last:border-0">
                      {item.image ? <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl border object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100"><Package /></div>}
                      <div className="min-w-0 flex-1"><p className="font-medium text-gray-800">{item.name}</p><p className="text-sm text-gray-500">Quantity: {item.quantity}</p></div>
                      <p className="whitespace-nowrap font-semibold">{currency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium">{selectedOrder.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment Status</span><span className="font-medium">{selectedOrder.paymentStatus}</span></div>
                <div className="flex justify-between border-t pt-3"><span className="font-semibold">Total Amount</span><span className="text-lg font-bold">{currency(selectedOrder.totalAmount)}</span></div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold">Update Order Status</h3>
                {statusProgression[selectedOrder.orderStatus]?.length ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex-1"><span className="sr-only">Next order status</span><select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="w-full rounded-xl border px-4 py-3">
                      <option value="">Select next status</option>
                      {statusProgression[selectedOrder.orderStatus].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select></label>
                    <button onClick={handleStatusChange} disabled={updatingId === selectedOrder._id || !nextStatus} className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50">
                      {updatingId === selectedOrder._id ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                ) : <p className="text-sm text-gray-500">This order has no further status transitions available.</p>}
              </section>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default AdminOrders
