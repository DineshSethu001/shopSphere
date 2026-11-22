
import { Link, NavLink } from 'react-router-dom'
import {
  ShoppingBag,
  Search,
  UserRound,
  ShoppingCart,
  Menu,
  Heart,
  Ticket,
  Package,
} from 'lucide-react'
import { useSelector } from 'react-redux'
function Navbar() {

    const cartItems = useSelector(
  (state) => state.cart.items
)

const cartCount = cartItems.reduce(
  (total, item) => total + item.quantity,
  0
)
const { user, isAuthenticated } = useSelector((state) => state.auth)
  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Free shipping on orders above ₹999
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Shop<span className="text-orange-500">Sphere</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Shop</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            {isAuthenticated && user && (
              <NavLink to="/my-orders">My Orders</NavLink>
            )}
            {isAuthenticated && user && (
              <NavLink to="/wishlist">Wishlist</NavLink>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <NavLink to="/admin/coupons">Coupons</NavLink>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <NavLink to="/admin/inventory">Inventory</NavLink>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            {isAuthenticated && user && (
              <Link to="/my-orders" className="md:hidden" aria-label="My orders">
                <ShoppingBag size={21} />
              </Link>
            )}
            {isAuthenticated && user && (
              <Link to="/wishlist" className="md:hidden" aria-label="Wishlist">
                <Heart size={21} />
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/coupons" className="md:hidden" aria-label="Manage coupons">
                <Ticket size={21} />
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/inventory" className="md:hidden" aria-label="Manage inventory">
                <Package size={21} />
              </Link>
            )}
            <button aria-label="Search">
              <Search size={21} />
            </button>

            <Link to="/login" aria-label="Login">
              <UserRound size={21} />
            </Link>

          
<Link
  to="/cart"
  className="relative"
  aria-label={`Shopping cart with ${cartCount} items`}
>
  <ShoppingCart size={21} />

  {cartCount > 0 && (
    <span className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
      {cartCount}
    </span>
  )}
</Link>


            <button className="md:hidden" aria-label="Menu">
              <Menu size={23} />
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
