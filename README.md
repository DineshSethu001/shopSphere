# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## SEO and sitemap

Set `VITE_SITE_URL` to the deployed storefront origin at build time. See `.env.example` for the local API and site URL format. Page canonical URLs are omitted until a real site URL is configured.

After building, generate a sitemap from the active products exposed by the public backend API:

```bash
VITE_SITE_URL=https://your-store-domain.example \
VITE_API_URL=https://your-api-domain.example/api \
npm run build

VITE_SITE_URL=https://your-store-domain.example \
VITE_API_URL=https://your-api-domain.example/api \
npm run generate:sitemap
```

The generator writes `dist/sitemap.xml` and `dist/robots.txt`. It includes the home page, catalog, and active product pages; authenticated and administrative routes are excluded. Publish the generated `dist` directory. The sitemap generator requires the backend API to be reachable during generation.

The storefront is a client-rendered React application. `react-helmet-async` updates metadata in the browser; dynamic product metadata may not be visible to every crawler without prerendering or server-side rendering.
