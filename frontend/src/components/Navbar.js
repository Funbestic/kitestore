import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();

    // Listen for cart updates
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    // Scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-r from-blue-600 to-blue-800'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Links to home page */}
          <Link 
            to="/" 
            className={`text-2xl font-bold transition-colors duration-200 ${
              scrolled ? 'text-blue-600' : 'text-white'
            }`}
          >
            🪁 KiteStore
          </Link>
          
          {/* Navigation Links - Right side */}
          <div className="flex space-x-6 items-center">
            {/* Wishlist Icon */}
            <Link 
              to="/wishlist" 
              className={`flex items-center space-x-1 transition-colors duration-200 relative ${
                scrolled ? 'text-gray-700 hover:text-pink-500' : 'text-white hover:text-pink-200'
              }`}
            >
              <span className="text-xl">❤️</span>
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className={`flex items-center space-x-1 transition-colors duration-200 relative ${
                scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
              }`}
            >
              <span className="text-xl">🛒</span>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className={`flex items-center space-x-1 transition-colors duration-200 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}>
                  <span className="text-xl">👤</span>
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">My Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">My Wishlist</Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Admin Dashboard</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                }`}
              >
                <span className="text-xl">👤</span>
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Admin Link - Only show if user is admin */}
            {user?.isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                }`}
              >
                <span className="text-xl">👑</span>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;