
import api from './api'

export const uploadProductImage = async (imageFile) => {
  const formData = new FormData()

  formData.append('image', imageFile)

  const { data } = await api.post(
    '/uploads/product-image',
    formData
  )

  return data.imageUrl
}
