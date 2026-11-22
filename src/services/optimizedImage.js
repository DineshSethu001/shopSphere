export const getOptimizedImageUrl = (imageUrl, width = 600) => {
  if (!imageUrl) return imageUrl

  try {
    const url = new URL(imageUrl)
    if (url.hostname !== 'res.cloudinary.com' || !url.pathname.includes('/image/upload/')) {
      return imageUrl
    }

    const safeWidth = Math.max(64, Math.min(2000, Math.round(width)))
    url.pathname = url.pathname.replace(
      '/image/upload/',
      `/image/upload/f_auto,q_auto,w_${safeWidth},c_limit/`
    )
    return url.toString()
  } catch {
    return imageUrl
  }
}

export const getOptimizedImageSrcSet = (imageUrl, widths = [320, 640, 960]) => {
  if (!imageUrl) return undefined
  const sources = widths.map((width) => ({
    url: getOptimizedImageUrl(imageUrl, width),
    width,
  }))
  if (new Set(sources.map((source) => source.url)).size === 1) return undefined
  return sources.map(({ url, width }) => `${url} ${width}w`).join(', ')
}
