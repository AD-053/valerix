import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import {
  ShoppingBagIcon,
  CubeIcon,
  TruckIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const products = [
  {
    id: 'ps5',
    name: 'PlayStation 5',
    price: 499,
    image: '🎮',
    color: 'from-blue-500 to-purple-600',
    description: 'Next-gen gaming console'
  },
  {
    id: 'xbox',
    name: 'Xbox Series X',
    price: 499,
    image: '🎯',
    color: 'from-green-500 to-emerald-600',
    description: 'Ultimate gaming experience'
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    price: 299,
    image: '🕹️',
    color: 'from-red-500 to-pink-600',
    description: 'Play anywhere, anytime'
  },
  {
    id: 'laptop',
    name: 'Gaming Laptop',
    price: 1299,
    image: '💻',
    color: 'from-purple-500 to-indigo-600',
    description: 'Power on the go'
  },
  {
    id: 'monitor',
    name: '4K Monitor',
    price: 699,
    image: '🖥️',
    color: 'from-cyan-500 to-blue-600',
    description: 'Crystal clear visuals'
  },
  {
    id: 'headset',
    name: 'Gaming Headset',
    price: 199,
    image: '🎧',
    color: 'from-pink-500 to-rose-600',
    description: 'Immersive audio'
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState('ps5');
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  useEffect(() => {
    fetchOrders();
    fetchInventory();
  }, []);

  const fetchOrders = async () => {
    setOrders([
      { id: 1, product: 'ps5', quantity: 2, status: 'completed', timestamp: new Date() },
      { id: 2, product: 'laptop', quantity: 1, status: 'pending', timestamp: new Date() },
    ]);
  };

  const fetchInventory = async () => {
    setInventory([
      { product_id: 'ps5', quantity: 50, location: 'NYC-Warehouse' },
      { product_id: 'xbox', quantity: 45, location: 'LA-Warehouse' },
      { product_id: 'laptop', quantity: 30, location: 'NYC-Warehouse' },
    ]);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Creating Order...',
      html: 'Please wait while we process your order',
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
    }).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Order Created!',
        html: `
          <div class="text-left">
            <p><strong>Product:</strong> ${products.find(p => p.id === selectedProduct).name}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Order ID:</strong> #${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        `,
        confirmButtonText: 'Awesome!',
        confirmButtonColor: '#8B5CF6',
      });

      toast.success('🎉 Order created successfully!', {
        position: "top-right",
        autoClose: 3000,
      });

      fetchOrders();
      setQuantity(1);
    });
  };

  const openAuth = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <Navbar onAuthClick={openAuth} />
      <ToastContainer />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl font-black text-white mb-6"
            >
              The Future of E-Commerce
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto"
            >
              Microservices architecture with circuit breakers and chaos engineering
            </motion.p>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <StatCard icon="⚡" value="99.9%" label="Uptime" />
              <StatCard icon="🚀" value="<50ms" label="Response Time" />
              <StatCard icon="🏆" value="#1" label="BUET Fest" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex overflow-x-auto mb-8 bg-white rounded-2xl p-2 shadow-xl">
          <Tab
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<ShoppingBagIcon className="w-5 h-5" />}
          >
            Products
          </Tab>
          <Tab
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            icon={<TruckIcon className="w-5 h-5" />}
          >
            Orders
          </Tab>
          <Tab
            active={activeTab === 'inventory'}
            onClick={() => setActiveTab('inventory')}
            icon={<CubeIcon className="w-5 h-5" />}
          >
            Inventory
          </Tab>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        isSelected={selectedProduct === product.id}
                        onSelect={() => setSelectedProduct(product.id)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 sticky top-4"
                  >
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Create Order
                    </h3>
                    <form onSubmit={handleCreateOrder} className="space-y-6">
                      <div>
                        <div className="text-4xl mb-2">
                          {products.find(p => p.id === selectedProduct)?.image}
                        </div>
                        <div className="text-lg font-semibold">
                          {products.find(p => p.id === selectedProduct)?.name}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          ${products.find(p => p.id === selectedProduct)?.price}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold hover:bg-purple-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold hover:bg-purple-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg text-lg hover:shadow-2xl transition-shadow"
                      >
                        Place Order 🚀
                      </button>
                    </form>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <OrderCard key={order.id} order={order} index={index} products={products} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory.map((item, index) => (
                  <InventoryCard key={item.product_id} item={item} index={index} products={products} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-black mb-2">VALERIX</h3>
          <p className="text-purple-300 mb-4">Built for BUET Fest Hackathon 2026</p>
          <p className="text-sm text-purple-400">
            🏆 Microservices • Circuit Breakers • Kubernetes
          </p>
        </div>
      </footer>
    </div>
  );
}

function Tab({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function ProductCard({ product, index, isSelected, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-3xl p-6 shadow-xl transition-all ${
        isSelected
          ? `ring-4 ring-purple-500 bg-gradient-to-br ${product.color}`
          : 'bg-white hover:shadow-2xl'
      }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 bg-white rounded-full p-2">
          <CheckCircleIcon className="w-6 h-6 text-purple-600" />
        </div>
      )}
      
      <div className="text-6xl mb-4">{product.image}</div>
      <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
        {product.name}
      </h3>
      <p className={`text-sm mb-4 ${isSelected ? 'text-purple-100' : 'text-gray-600'}`}>
        {product.description}
      </p>
      <div className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-purple-600'}`}>
        ${product.price}
      </div>
    </motion.div>
  );
}

function OrderCard({ order, index, products }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">
            {products.find(p => p.id === order.product)?.image}
          </div>
          <div>
            <h3 className="font-bold text-lg">Order #{order.id}</h3>
            <p className="text-gray-600">{products.find(p => p.id === order.product)?.name}</p>
            <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
            order.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {order.status === 'completed' ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <ClockIcon className="w-5 h-5 mr-2" />
          )}
          {order.status}
        </span>
      </div>
    </motion.div>
  );
}

function InventoryCard({ item, index, products }) {
  const product = products.find(p => p.id === item.product_id);
  const stockLevel = item.quantity > 30 ? 'high' : item.quantity > 10 ? 'medium' : 'low';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="text-5xl mb-4">{product?.image}</div>
      <h3 className="font-bold text-lg mb-2">{product?.name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Stock:</span>
          <span className={`font-bold ${
            stockLevel === 'high' ? 'text-green-600' :
            stockLevel === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {item.quantity} units
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="font-semibold">{item.location}</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-white"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-purple-200">{label}</div>
    </motion.div>
  );
}
