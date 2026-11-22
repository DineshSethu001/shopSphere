import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const rawSiteUrl = process.env.VITE_SITE_URL?.trim()
if (!rawSiteUrl) {
  throw new Error('Set VITE_SITE_URL to the deployed storefront origin before generating the sitemap.')
}

const site = new URL(rawSiteUrl)
if (
  !['http:', 'https:'].includes(site.protocol) ||
  (site.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(site.hostname)) ||
  site.pathname !== '/' || site.search || site.hash
) {
  throw new Error('VITE_SITE_URL must be an HTTPS origin (HTTP is allowed for localhost only).')
}
const siteUrl = site.origin

const apiBase = (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
const products = []
let page = 1

while (page <= 10000) {
  const response = await fetch(`${apiBase}/products?limit=50&page=${page}`)
  if (!response.ok) {
    throw new Error(`Product API returned ${response.status} while generating the sitemap.`)
  }

  const result = await response.json()
  if (!result.success || !Array.isArray(result.products)) {
    throw new Error('Product API returned an unexpected sitemap response.')
  }

  products.push(...result.products)
  if (!result.pagination?.hasNextPage) break
  page += 1
}

if (page > 10000) {
  throw new Error('Product sitemap exceeded 10,000 pages; split it into multiple sitemaps.')
}

const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const urls = [
  { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${siteUrl}/products`, priority: '0.9', changefreq: 'daily' },
  ...products.map((product) => ({
    loc: `${siteUrl}/products/${encodeURIComponent(product._id || product.id)}`,
    lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString().slice(0, 10) : undefined,
    priority: '0.7',
    changefreq: 'weekly',
  })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(({ loc, lastmod, priority, changefreq }) => `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`).join('\n') +
  '\n</urlset>\n'

const distDirectory = resolve('dist')
await mkdir(distDirectory, { recursive: true })
await Promise.all([
  writeFile(resolve(distDirectory, 'sitemap.xml'), sitemap),
  writeFile(resolve(distDirectory, 'robots.txt'), [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /checkout',
    'Disallow: /my-orders',
    'Disallow: /wishlist',
    'Disallow: /order-success',
    'Disallow: /track-order',
    'Disallow: /login',
    'Disallow: /register',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')),
])

console.log(`Generated sitemap with ${urls.length} public URLs in dist/sitemap.xml`)
