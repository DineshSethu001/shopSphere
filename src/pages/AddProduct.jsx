
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Loader2,
  Package,
  UploadCloud,
  ImagePlus,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { createProduct } from '../services/productService'
import { uploadProductImage } from '../services/imageService'

const initialForm = {
  name: '',
  price: '',
  category: '',
  description: '',
  image: '',
  stock: '',
  isActive: true,
}

const AddProduct = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Upload image to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP and GIF images are allowed.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be below 5 MB.')
      e.target.value = ''
      return
    }

    try {
      setUploadingImage(true)

      const imageUrl = await uploadProductImage(file)

      setFormData((prev) => ({
        ...prev,
        image: imageUrl,
      }))

      toast.success('Product image uploaded successfully!')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Image upload failed.'
      )
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  // Remove selected image URL
  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
  }

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploadingImage) {
      toast.error('Please wait for the image upload to finish.')
      return
    }

    if (
      !formData.name.trim() ||
      !formData.category ||
      formData.price === '' ||
      formData.stock === ''
    ) {
      toast.error('Please fill in all required fields.')
      return
    }

    const price = Number(formData.price)
    const stock = Number(formData.stock)

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid product price.')
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error('Stock must be a non-negative whole number.')
      return
    }

    const productData = {
      name: formData.name.trim(),
      price,
      category: formData.category,
      description: formData.description.trim(),
      image: formData.image,
      stock,
      isActive: formData.isActive,
    }

    try {
      setLoading(true)

      await createProduct(productData)

      toast.success('Product added successfully!')

      setFormData(initialForm)

      navigate('/admin/products')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to add product.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/products"
            className="p-3 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add New Product
            </h1>

            <p className="text-gray-500 mt-1">
              Add a new product to your ShopSphere store.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
        >

          {/* Section Heading */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={24} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Product Information
              </h2>

              <p className="text-sm text-gray-500">
                Enter the details of your product.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="Enter product name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Product Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="Enter product price"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Accessories">Accessories</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Stock *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                required
                placeholder="Enter stock quantity"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Cloudinary Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 transition ${
                  uploadingImage
                    ? 'bg-blue-50 border-blue-300'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2
                      size={36}
                      className="text-blue-600 animate-spin"
                    />

                    <span className="text-sm font-medium text-blue-600">
                      Uploading image to Cloudinary...
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus size={36} className="text-gray-400" />

                    <span className="font-medium text-gray-700">
                      Click to upload product image
                    </span>

                    <span className="text-xs text-gray-500">
                      JPG, PNG, WEBP or GIF (Maximum 5 MB)
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploadingImage || loading}
                  className="hidden"
                />
              </label>

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-5 border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Uploaded Image Preview
                    </p>

                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={loading}
                      className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 disabled:opacity-50"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>

                  <img
                    src={formData.image}
                    alt="Product preview"
                    className="w-40 h-40 object-cover rounded-xl border"
                  />

                  <p className="text-xs text-gray-400 mt-2 break-all">
                    {formData.image}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                maxLength={3000}
                placeholder="Write product description..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <p className="text-xs text-gray-400 text-right mt-1">
                {formData.description.length}/3000 characters
              </p>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-5 h-5 accent-blue-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Active Product
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Make this product visible in your online store.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Form Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">

            <Link
              to="/admin/products"
              className="px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Product...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Product
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProduct
