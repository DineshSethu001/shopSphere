import { useCallback, useEffect, useState } from 'react'
import {
  CalendarDays,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Tag,
  Ticket,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createCoupon, fetchCoupons, updateCouponStatus } from '../services/couponService'

const initialForm = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '0',
  maxDiscount: '',
  usageLimit: '100',
  expiryDate: '',
}

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0)

function getCouponState(coupon) {
  if (!coupon.isActive) return 'Inactive'
  if (new Date(coupon.expiryDate) <= new Date()) return 'Expired'
  if (coupon.usedCount >= coupon.usageLimit) return 'Limit reached'
  return 'Active'
}

const statusStyles = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Expired: 'bg-red-100 text-red-700',
  'Limit reached': 'bg-red-100 text-red-700',
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchCoupons()
      setCoupons(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load coupons.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: name === 'code' ? value.toUpperCase() : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const discountValue = Number(formData.discountValue)
    const minOrderAmount = Number(formData.minOrderAmount)
    const usageLimit = Number(formData.usageLimit)
    const maxDiscount = formData.maxDiscount === '' ? null : Number(formData.maxDiscount)

    if (!/^[A-Z0-9_-]{3,30}$/.test(formData.code.trim())) {
      toast.error('Coupon code must be 3–30 letters, numbers, underscores, or hyphens.')
      return
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0 || (formData.discountType === 'PERCENTAGE' && discountValue > 100)) {
      toast.error('Enter a valid discount value.')
      return
    }
    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0 || !Number.isInteger(usageLimit) || usageLimit < 1 || (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0))) {
      toast.error('Check the minimum amount, maximum discount, and usage limit.')
      return
    }
    if (!formData.expiryDate || new Date(formData.expiryDate) <= new Date()) {
      toast.error('Choose a future expiry date.')
      return
    }

    try {
      setSaving(true)
      await createCoupon({
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        expiryDate: new Date(formData.expiryDate).toISOString(),
      })
      toast.success('Coupon created successfully.')
      setFormData(initialForm)
      setShowForm(false)
      await loadCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (coupon) => {
    try {
      setUpdatingId(coupon._id)
      const updatedCoupon = await updateCouponStatus(coupon._id, !coupon.isActive)
      setCoupons((current) => current.map((item) => (
        item._id === coupon._id ? updatedCoupon : item
      )))
      toast.success(`Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'}.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update coupon.')
    } finally {
      setUpdatingId(null)
    }
  }

  const activeCount = coupons.filter((coupon) => getCouponState(coupon) === 'Active').length
  const redemptionCount = coupons.reduce((total, coupon) => total + Number(coupon.usedCount || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Coupon Management</h1>
            <p className="mt-2 text-gray-500">Create and manage your store discount campaigns.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadCoupons} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 hover:bg-gray-100 disabled:opacity-50">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowForm((visible) => !visible)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
              <Plus size={18} /> Create Coupon
            </button>
          </div>
        </header>

        <section aria-label="Coupon summary" className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: 'Total Coupons', value: coupons.length, icon: Ticket, tone: 'text-blue-600' },
            { label: 'Currently Active', value: activeCount, icon: Tag, tone: 'text-green-600' },
            { label: 'Total Redemptions', value: redemptionCount, icon: Percent, tone: 'text-purple-600' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className="rounded-2xl border bg-white p-6 shadow-sm">
              <Icon className={`${tone} mb-3`} size={26} />
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </article>
          ))}
        </section>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Ticket size={23} /></span>
              <div><h2 className="text-xl font-bold">Create New Coupon</h2><p className="text-sm text-gray-500">Configure a discount campaign.</p></div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium">Coupon Code *
                <input name="code" value={formData.code} onChange={handleChange} required maxLength={30} placeholder="Example: SAVE20" className="mt-2 w-full rounded-xl border px-4 py-3 uppercase" />
              </label>
              <label className="text-sm font-medium">Discount Type *
                <select name="discountType" value={formData.discountType} onChange={handleChange} className="mt-2 w-full rounded-xl border px-4 py-3">
                  <option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </label>
              <label className="text-sm font-medium">Discount Value *
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} min="0.01" max={formData.discountType === 'PERCENTAGE' ? 100 : undefined} step="0.01" required className="mt-2 w-full rounded-xl border px-4 py-3" />
              </label>
              <label className="text-sm font-medium">Minimum Order Amount (₹)
                <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} min="0" step="0.01" className="mt-2 w-full rounded-xl border px-4 py-3" />
              </label>
              <label className="text-sm font-medium">Maximum Discount (₹)
                <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} min="0" step="0.01" placeholder="Optional" className="mt-2 w-full rounded-xl border px-4 py-3" />
              </label>
              <label className="text-sm font-medium">Usage Limit *
                <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} min="1" step="1" required className="mt-2 w-full rounded-xl border px-4 py-3" />
              </label>
              <label className="text-sm font-medium md:col-span-2">Expiry Date *
                <input type="datetime-local" name="expiryDate" value={formData.expiryDate} onChange={handleChange} min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} required className="mt-2 w-full rounded-xl border px-4 py-3" />
              </label>
            </div>

            <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-6 py-3 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}{saving ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <header className="border-b p-6"><h2 className="text-lg font-bold">All Coupons ({coupons.length})</h2></header>
          {loading ? (
            <div className="flex justify-center py-16" role="status"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="sr-only">Loading coupons</span></div>
          ) : error && coupons.length === 0 ? (
            <p className="p-8 text-center text-red-600" role="alert">{error}</p>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center"><Ticket size={42} className="mx-auto mb-3 text-gray-300" /><p className="font-semibold text-gray-700">No coupons created yet.</p><p className="mt-1 text-sm text-gray-500">Create your first discount campaign.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr><th className="p-4">Coupon</th><th className="p-4">Discount</th><th className="p-4">Minimum Order</th><th className="p-4">Usage</th><th className="p-4">Expiry</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const status = getCouponState(coupon)
                    const cannotActivate = !coupon.isActive && (
                      new Date(coupon.expiryDate) <= new Date() || coupon.usedCount >= coupon.usageLimit
                    )
                    return (
                      <tr key={coupon._id} className="border-t text-sm hover:bg-gray-50">
                        <td className="p-4"><p className="font-bold text-gray-800">{coupon.code}</p><p className="text-xs text-gray-400">{coupon.discountType}</p></td>
                        <td className="p-4 font-semibold">
                          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : currency(coupon.discountValue)}
                          {coupon.maxDiscount != null && <p className="text-xs font-normal text-gray-400">Max {currency(coupon.maxDiscount)}</p>}
                        </td>
                        <td className="whitespace-nowrap p-4">{currency(coupon.minOrderAmount)}</td>
                        <td className="whitespace-nowrap p-4">{coupon.usedCount} / {coupon.usageLimit}</td>
                        <td className="whitespace-nowrap p-4"><span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-gray-400" />{new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</span></td>
                        <td className="p-4"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span></td>
                        <td className="p-4">
                          <button onClick={() => handleToggleStatus(coupon)} disabled={updatingId === coupon._id || cannotActivate} className="inline-flex items-center gap-2 whitespace-nowrap text-blue-600 hover:text-blue-800 disabled:opacity-40">
                            {updatingId === coupon._id ? <Loader2 size={19} className="animate-spin" /> : coupon.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminCoupons
