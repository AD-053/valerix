import { motion } from 'framer-motion';
import { ShoppingCartIcon, UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Navbar({ onAuthClick }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl relative overflow-hidden"
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-30 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"
            >
              <ShoppingCartIcon className="w-7 h-7 text-purple-600" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                VALERIX
              </h1>
              <p className="text-xs text-purple-100 font-medium">E-Commerce Excellence</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#home">Home</NavLink>
            <NavLink href="#products">Products</NavLink>
            <NavLink href="#inventory">Inventory</NavLink>
            <NavLink href="#monitoring">Monitoring</NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAuthClick('login')}
              className="px-6 py-2.5 text-white font-semibold rounded-full border-2 border-white hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAuthClick('register')}
              className="px-6 py-2.5 bg-white text-purple-600 font-bold rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 flex items-center space-x-2"
            >
              <UserCircleIcon className="w-5 h-5" />
              <span>Sign Up</span>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-purple-700 bg-opacity-95 backdrop-blur-lg"
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            <MobileNavLink href="#home">Home</MobileNavLink>
            <MobileNavLink href="#products">Products</MobileNavLink>
            <MobileNavLink href="#inventory">Inventory</MobileNavLink>
            <MobileNavLink href="#monitoring">Monitoring</MobileNavLink>
            <div className="pt-4 space-y-2">
              <button
                onClick={() => onAuthClick('login')}
                className="w-full px-4 py-2 text-white font-semibold rounded-lg border-2 border-white"
              >
                Login
              </button>
              <button
                onClick={() => onAuthClick('register')}
                className="w-full px-4 py-2 bg-white text-purple-600 font-bold rounded-lg"
              >
                Sign Up
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function NavLink({ href, children }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.1, y: -2 }}
      className="text-white hover:text-purple-200 font-semibold text-sm transition-colors cursor-pointer"
    >
      {children}
    </motion.a>
  );
}

function MobileNavLink({ href, children }) {
  return (
    <a
      href={href}
      className="block px-4 py-2 text-white hover:bg-purple-600 rounded-lg transition-colors"
    >
      {children}
    </a>
  );
}
