import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home.jsx'))
const Products = lazy(() => import('./pages/Products.jsx'))
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'))
const OrderTracking = lazy(() => import('./pages/OrderTracking.jsx'))
const MyOrders = lazy(() => import('./pages/MyOrders.jsx'))
const OrderDetails = lazy(() => import('./pages/OrderDetails.jsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const AdminProducts = lazy(() => import('./pages/AdminProducts.jsx'))
const AdminOrders = lazy(() => import('./pages/AdminOrders.jsx'))
const AddProduct = lazy(() => import('./pages/AddProduct.jsx'))
const UpdateProduct = lazy(() => import('./pages/UpdateProduct.jsx'))
const AdminCoupons = lazy(() => import('./pages/AdminCoupons.jsx'))
const AdminInventory = lazy(() => import('./pages/AdminInventory.jsx'))

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<div className="p-10 text-center" role="status">Loading ShopSphere...</div>}>
        <Routes>
          {/* Storefront */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-orders/:id" element={<OrderDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>

          {/* Admin protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/edit/:id" element={<UpdateProduct />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
