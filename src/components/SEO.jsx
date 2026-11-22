import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const getSiteUrl = () => {
  try {
    const url = new URL(import.meta.env.VITE_SITE_URL)
    const localHost = ['localhost', '127.0.0.1'].includes(url.hostname)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (url.protocol !== 'https:' && !localHost) ||
      url.pathname !== '/' || url.search || url.hash
    ) return undefined
    return url.origin
  } catch {
    return undefined
  }
}

const siteUrl = getSiteUrl()

function SEO({
  title = 'Online Shopping',
  description = 'Discover quality products at great prices with ShopSphere.',
  keywords,
  image,
  noIndex = false,
  type = 'website',
  structuredData,
}) {
  const { pathname } = useLocation()
  const fullTitle = title.includes('ShopSphere') ? title : `${title} | ShopSphere`
  const canonicalUrl = siteUrl ? new URL(pathname, `${siteUrl}/`).href : undefined
  const imageUrl = image && (/^https?:\/\//i.test(image)
    ? image
    : siteUrl ? `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}` : undefined)
  const safeStructuredData = structuredData
    ? JSON.stringify(structuredData).replace(/</g, '\\u003c')
    : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={Array.isArray(keywords) ? keywords.join(', ') : keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:site_name" content="ShopSphere" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {safeStructuredData && <script type="application/ld+json">{safeStructuredData}</script>}
    </Helmet>
  )
}

export default SEO
