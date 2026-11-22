import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Loader2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchProductById, updateProduct } from '../services/productService'
import { uploadProductImage } from '../services/imageService'

const categories = [
  'Electronics',
  'Fashion',
  'Accessories',
  'Home & Kitchen',
  'Sports',
]

function UpdateProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    fetchProductById(id)
      .then((product) => {
        if (active) {
          setForm({
            name: product.name || '',
            price: String(product.price ?? ''),
            category: product.category || '',
            description: product.description || '',
            image: product.image || '',
            stock: String(product.stock ?? 0),
            isActive: product.isActive ?? true,
          })
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Could not load this product.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [id])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, WEBP, or GIF image.')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be below 5 MB.')
      event.target.value = ''
      return
    }

    try {
      setUploading(true)
      const image = await uploadProductImage(file)
      setForm((current) => ({ ...current, image }))
      toast.success('Image uploaded.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const price = Number(form.price)
    const stock = Number(form.stock)

    if (!form.name.trim() || !form.category || form.price === '' || form.stock === '') {
      toast.error('Fill in all required fields.')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid price.')
      return
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error('Stock must be a non-negative whole number.')
      return
    }

    try {
      setSaving(true)
      await updateProduct(id, {
        ...form,
        name: form.name.trim(),
        price,
        stock,
        category: form.category.trim(),
        description: form.description.trim(),
      })
      toast.success('Product updated successfully.')
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="p-10 text-center text-gray-500">Loading product...</p>
  }

  if (error || !form) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center">
        <p className="mb-5 text-red-600" role="alert">{error || 'Product not found.'}</p>
        <Link to="/admin/products" className="font-semibold text-blue-600">Back to products</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center gap-4">
          <Link to="/admin/products" aria-label="Back to products" className="rounded-xl bg-white p-3 shadow-sm hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Update Product</h1>
            <p className="mt-1 text-gray-500">Edit product details and inventory.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Product name *
              <input name="name" value={form.name} onChange={handleChange} required className="mt-2 w-full rounded-xl border px-4 py-3" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Price (₹) *
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="mt-2 w-full rounded-xl border px-4 py-3" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Category *
              <select name="category" value={form.category} onChange={handleChange} required className="mt-2 w-full rounded-xl border px-4 py-3">
                <option value="">Select category</option>
                {!categories.includes(form.category) && form.category && <option value={form.category}>{form.category}</option>}
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Stock *
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required className="mt-2 w-full rounded-xl border px-4 py-3" />
            </label>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Product image</label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm hover:bg-gray-50">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                {uploading ? 'Uploading image...' : 'Upload image'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
              </label>
              {form.image && (
                <div className="mt-4 flex items-start gap-3">
                  <img src={form.image} alt="Product preview" className="h-28 w-28 rounded-xl border object-cover" />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, image: '' }))} className="inline-flex items-center gap-1 text-sm text-red-600">
                    <X size={16} /> Remove image
                  </button>
                </div>
              )}
            </div>

            <label className="text-sm font-medium text-gray-700 md:col-span-2">
              Description
              <textarea name="description" rows="5" value={form.description} onChange={handleChange} className="mt-2 w-full resize-y rounded-xl border px-4 py-3" />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 md:col-span-2">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="h-5 w-5 accent-blue-600" />
              Make this product visible in the store
            </label>
          </div>

          <div className="flex flex-col-reverse justify-end gap-3 border-t pt-5 sm:flex-row">
            <Link to="/admin/products" className="rounded-xl border px-6 py-3 text-center hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={saving || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default UpdateProduct
