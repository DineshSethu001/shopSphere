# 🛍️ ShopSphere – Full-Stack MERN E-Commerce Platform

A modern, responsive e-commerce platform built using the MERN stack, featuring a customer storefront, secure authentication, online payments and a comprehensive admin dashboard.

🌐 **Live Demo:** https://shopsphere-black-seven.vercel.app/

---

## 📌 Project Overview

ShopSphere is a full-stack e-commerce application designed to provide a seamless online shopping experience. Customers can explore products, search and filter items, manage their shopping carts, place orders and make secure online payments.

The platform also includes an admin dashboard that allows administrators to manage products, orders, coupons and inventory efficiently.

## ✨ Highlights

- **User Authentication:** Secure registration, login and JWT-based authentication with role-based access control.
- **Product Discovery:** Browse, search, filter, sort and paginate products.
- **Shopping Cart:** Add products, update quantities and manage cart items.
- **Wishlist:** Save and manage favourite products.
- **Order Management:** Place orders, view order history and cancel eligible orders.
- **Payment Integration:** Razorpay payment gateway with server-side signature verification and webhook handling.
- **Product Reviews:** Submit reviews and ratings for eligible purchases.
- **Coupon Management:** Percentage-based and fixed-amount discounts with validation.
- **Admin Dashboard:** Manage products, orders, coupons and inventory.
- **Image Uploads:** Cloudinary integration for product image storage.
- **Responsive Design:** Optimized layouts for desktop, tablet and mobile.
- **SEO Optimization:** Page metadata, canonical URLs, sitemap and robots.txt generation.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit, Redux Persist |
| Routing | React Router DOM |
| API Communication | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Image Storage | Cloudinary, Multer |
| Payment Gateway | Razorpay |
| API Testing | Postman |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## 📂 Project Structure

```text
ShopSphere/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── services/
│   ├── hooks/
│   ├── data/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── .env.example
├── package.json
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL

cd ShopSphere
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment variables

Create a `.env.local` file in the project root.

```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
```

### 4. Start the frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### 5. Configure the backend

```bash
cd backend

npm install
```

Create a `.env` file inside the backend directory.

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

FRONTEND_URL=http://localhost:5173
```

Use your actual credentials locally. Never commit `.env` files or expose private credentials in frontend code.

### 6. Start the backend

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

## 🔍 SEO & Sitemap

ShopSphere supports SEO metadata using `react-helmet-async`.

Configure the deployed storefront URL and backend API URL during the build.

```bash
VITE_SITE_URL=https://shopsphere-black-seven.vercel.app \
VITE_API_URL=https://your-api-domain.example/api \
npm run build
```

Generate the sitemap:

```bash
VITE_SITE_URL=https://shopsphere-black-seven.vercel.app \
VITE_API_URL=https://your-api-domain.example/api \
npm run generate:sitemap
```

The sitemap generator creates:

- `dist/sitemap.xml`
- `dist/robots.txt`

It includes the homepage, product catalog and active product pages. Private customer and admin routes are excluded.

**SEO Note:** ShopSphere currently uses client-side React rendering. For stronger search engine visibility on dynamic product pages, prerendering or server-side rendering can be considered.

## 🚀 Deployment

### Frontend – Vercel

1. Connect the GitHub repository to Vercel.
2. Select Vite as the framework.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Configure `VITE_API_URL` and `VITE_SITE_URL`.
6. Deploy the application.

### Backend – Render

Create a Render Web Service with:

| Configuration | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |

The backend build command should be used only if the `build` script exists in `backend/package.json`. In this project, it can be configured to syntax-check JavaScript files rather than generate a separate bundle.

Configure all backend environment variables through Render's Environment settings.

## 🔐 Security Features

- Password hashing with bcryptjs.
- JWT authentication.
- Role-based access control.
- Protected API routes.
- Request validation.
- API rate limiting.
- Helmet security headers.
- CORS configuration.
- Razorpay signature verification.
- Secure environment variable management.

## 🎯 Project Objectives

- Build a complete full-stack e-commerce application.
- Develop practical REST API integration skills.
- Implement secure authentication and authorization.
- Understand database relationships and transactions.
- Integrate third-party services and payment gateways.
- Develop an admin dashboard for business operations.
- Deploy and maintain a production-oriented web application.

## 🔮 Future Enhancements

- AI-powered product recommendations.
- Email and SMS order notifications.
- Advanced sales analytics.
- Product comparison.
- Real-time order tracking.
- Progressive Web App support.

## 👨‍💻 Developer

**Dinesh**

Full-Stack MERN Developer

Interested in building scalable web applications, interactive user interfaces and practical software solutions.

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with ❤️ using the MERN Stack.**
