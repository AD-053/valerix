import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function HealthDashboard() {
  const [orderHealth, setOrderHealth] = useState(null);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderServiceResponseTime, setOrderServiceResponseTime] = useState(0);
  const [orderResponseTimes, setOrderResponseTimes] = useState([]);
  const [lastAlertState, setLastAlertState] = useState(false);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 2000); // Check every 2 seconds for better 30s window coverage
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    const orderStartTime = Date.now();

    try {
      // Measure Order Service response time separately
      const orderPromise = axios.get(`${process.env.NEXT_PUBLIC_ORDER_API_URL}/health/deep`, { timeout: 10000 })
        .then(response => {
          const orderEndTime = Date.now();
          const orderResponseTime = orderEndTime - orderStartTime;
          
          // Update response times with timestamp for 30-second rolling window
          setOrderResponseTimes(prev => {
            const now = Date.now();
            const thirtySecondsAgo = now - 30000;
            
            // Keep only measurements from last 30 seconds
            const filtered = prev.filter(item => item.timestamp > thirtySecondsAgo);
            
            // Add new measurement
            const updated = [...filtered, { time: orderResponseTime, timestamp: now }];
            
            // Calculate average over 30-second window
            const avg = updated.reduce((sum, item) => sum + item.time, 0) / updated.length;
            setOrderServiceResponseTime(avg);
            
            // Alert state change
            const isAlert = avg > 1000;
            if (isAlert !== lastAlertState) {
              setLastAlertState(isAlert);
            }
            
            return updated;
          });
          
          return { status: 'fulfilled', value: response };
        })
        .catch(error => ({ status: 'rejected', reason: error }));

      const inventoryPromise = axios.get(`${process.env.NEXT_PUBLIC_INVENTORY_API_URL}/health`, { timeout: 10000 })
        .then(response => ({ status: 'fulfilled', value: response }))
        .catch(error => ({ status: 'rejected', reason: error }));

      const [orderResponse, inventoryResponse] = await Promise.all([orderPromise, inventoryPromise]);

      if (orderResponse.status === 'fulfilled') {
        setOrderHealth({
          healthy: true,
          ...orderResponse.value.data,
        });
      } else {
        setOrderHealth({
          healthy: false,
          error: orderResponse.reason?.message || 'Connection failed',
        });
      }

      if (inventoryResponse.status === 'fulfilled') {
        setInventoryHealth({
          healthy: true,
          ...inventoryResponse.value.data,
        });
      } else {
        setInventoryHealth({
          healthy: false,
          error: inventoryResponse.reason?.message || 'Connection failed',
        });
      }

    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (healthy) => {
    return healthy ? 'bg-green-500' : 'bg-red-500';
  };

  const getResponseTimeColor = () => {
    if (orderServiceResponseTime > 1000) return 'bg-red-500'; // Red if > 1 second
    if (orderServiceResponseTime > 500) return 'bg-yellow-500'; // Yellow if > 500ms
    return 'bg-green-500'; // Green otherwise
  };

  const getResponseTimeTextColor = () => {
    if (orderServiceResponseTime > 1000) return 'text-red-600';
    if (orderServiceResponseTime > 500) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing health monitoring...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner - Order Service Response Time */}
      <AnimatePresence>
        {orderServiceResponseTime > 1000 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-gradient-to-r from-red-600 via-red-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl border-4 border-red-700"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="text-6xl"
              >
                🚨
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-1">⚠️ CRITICAL ALERT</h3>
                <p className="text-lg font-semibold opacity-95">
                  Order Service response time exceeds 1 second threshold!
                </p>
                <p className="text-sm opacity-80 mt-1">
                  Rolling 30-second average: <span className="font-bold">{orderServiceResponseTime.toFixed(0)}ms</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black">{orderServiceResponseTime.toFixed(0)}ms</div>
                <div className="text-sm opacity-90">Current Average</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Service Response Time Monitor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 shadow-xl transition-all ${getResponseTimeColor()}`}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={orderServiceResponseTime > 1000 ? { 
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ 
                duration: 1,
                repeat: orderServiceResponseTime > 1000 ? Infinity : 0
              }}
              className="text-5xl"
            >
              {orderServiceResponseTime > 1000 ? '🔴' : orderServiceResponseTime > 500 ? '🟡' : '🟢'}
            </motion.div>
            <div>
              <h3 className="text-2xl font-black mb-1">Order Service Response Time</h3>
              <p className="text-sm opacity-90">
                {orderServiceResponseTime > 1000 
                  ? '⚠️ Performance degraded - exceeds 1 second threshold' 
                  : orderServiceResponseTime > 500
                  ? '⚡ Slight delay detected'
                  : '✓ System responding optimally'}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Tracking: {orderResponseTimes.length} measurements over 30-second window
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black">{orderServiceResponseTime.toFixed(0)}ms</p>
            <p className="text-sm opacity-90">30s rolling average</p>
          </div>
        </div>
      </motion.div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Service */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className={`px-6 py-4 flex items-center justify-between ${
            orderHealth?.healthy ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'
          }`}>
            <h3 className="text-xl font-black text-white">Order Service</h3>
            <div className="flex items-center space-x-2">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-4 h-4 rounded-full ${getStatusColor(orderHealth?.healthy)}`}
              ></motion.div>
              <span className="text-sm font-bold text-white">
                {orderHealth?.healthy ? '✓ Healthy' : '✗ Degraded'}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-3">
            {orderHealth?.checks && Object.entries(orderHealth.checks).map(([key, value]) => {
              if (key.includes('error')) {
                return (
                  <div key={key} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-sm font-semibold text-red-800 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <p className="text-sm text-red-600 mt-1">{value}</p>
                  </div>
                );
              }
              return (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    value === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {value}
                  </span>
                </div>
              );
            })}
            
            {orderHealth?.details && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Database Details:</h4>
                {Object.entries(orderHealth.details.database || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs text-blue-800">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {orderHealth?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800">Connection Error:</p>
                <p className="text-sm text-red-600 mt-1">{orderHealth.error}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Inventory Service */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className={`px-6 py-4 flex items-center justify-between ${
            inventoryHealth?.healthy ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'
          }`}>
            <h3 className="text-xl font-black text-white">Inventory Service</h3>
            <div className="flex items-center space-x-2">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-4 h-4 rounded-full ${getStatusColor(inventoryHealth?.healthy)}`}
              ></motion.div>
              <span className="text-sm font-bold text-white">
                {inventoryHealth?.healthy ? '✓ Healthy' : '✗ Degraded'}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-3">
            {inventoryHealth?.checks && Object.entries(inventoryHealth.checks).map(([key, value]) => {
              if (key.includes('error')) {
                return (
                  <div key={key} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-sm font-semibold text-red-800 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <p className="text-sm text-red-600 mt-1">{value}</p>
                  </div>
                );
              }
              return (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    value === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {value}
                  </span>
                </div>
              );
            })}
            
            {inventoryHealth?.details && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Database Details:</h4>
                {Object.entries(inventoryHealth.details.database || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs text-blue-800">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {inventoryHealth?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800">Connection Error:</p>
                <p className="text-sm text-red-600 mt-1">{inventoryHealth.error}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* System Info Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200"
      >
        <h3 className="text-2xl font-black text-purple-900 mb-6 flex items-center">
          <span className="text-3xl mr-3">📊</span>
          System Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Order Service</p>
            <p className={`text-2xl font-black ${orderHealth?.healthy ? 'text-green-600' : 'text-red-600'}`}>
              {orderHealth?.healthy ? '✓ Online' : '✗ Offline'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Inventory Service</p>
            <p className={`text-2xl font-black ${inventoryHealth?.healthy ? 'text-green-600' : 'text-red-600'}`}>
              {inventoryHealth?.healthy ? '✓ Online' : '✗ Offline'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Avg Response</p>
            <p className={`text-2xl font-black ${getResponseTimeTextColor()}`}>
              {orderServiceResponseTime.toFixed(0)}ms
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Last Check</p>
            <p className="text-2xl font-black text-purple-600">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {/* Performance Indicator */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">Performance Status:</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              orderServiceResponseTime > 1000 
                ? 'bg-red-100 text-red-700' 
                : orderServiceResponseTime > 500 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {orderServiceResponseTime > 1000 ? 'CRITICAL' : orderServiceResponseTime > 500 ? 'WARNING' : 'OPTIMAL'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((orderServiceResponseTime / 2000) * 100, 100)}%`,
                backgroundColor: orderServiceResponseTime > 1000 ? '#ef4444' : orderServiceResponseTime > 500 ? '#eab308' : '#22c55e'
              }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0ms</span>
            <span>1000ms (Threshold)</span>
            <span>2000ms</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
