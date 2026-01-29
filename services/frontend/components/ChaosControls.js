import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ChaosControls() {
  const [chaosConfig, setChaosConfig] = useState({
    latency: false,
    latency_ms: 5000,
    crash_rate: 0,
    partial_failure_rate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_INVENTORY_API_URL}/api/admin/chaos`
      );
      setCurrentConfig(response.data.config);
      
      // Check if any chaos is active
      const config = response.data.config;
      setIsActive(
        config.latency || 
        config.crash_rate > 0 || 
        config.partial_failure_rate > 0
      );
    } catch (error) {
      console.error('Error fetching chaos config:', error);
    }
  };

  const handleApply = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_INVENTORY_API_URL}/api/admin/chaos`,
        chaosConfig
      );

      setMessage({
        type: 'success',
        text: 'Chaos configuration applied successfully!',
      });

      fetchCurrentConfig();

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to apply chaos configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_INVENTORY_API_URL}/api/admin/chaos`
      );

      setChaosConfig({
        latency: false,
        latency_ms: 5000,
        crash_rate: 0,
        partial_failure_rate: 0,
      });

      setMessage({
        type: 'success',
        text: 'Chaos engineering disabled',
      });

      fetchCurrentConfig();

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to disable chaos engineering',
      });
    } finally {
      setLoading(false);
    }
  };

  const presets = {
    mild: {
      latency: true,
      latency_ms: 2000,
      crash_rate: 0.1,
      partial_failure_rate: 0.05,
    },
    moderate: {
      latency: true,
      latency_ms: 5000,
      crash_rate: 0.3,
      partial_failure_rate: 0.2,
    },
    extreme: {
      latency: true,
      latency_ms: 10000,
      crash_rate: 0.5,
      partial_failure_rate: 0.3,
    },
  };

  const applyPreset = async (preset) => {
    const config = presets[preset];
    setChaosConfig(config);
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_INVENTORY_API_URL}/api/admin/chaos`,
        config
      );

      setMessage({
        type: 'success',
        text: `🔥 ${preset.charAt(0).toUpperCase() + preset.slice(1)} Chaos Applied!`,
      });

      fetchCurrentConfig();
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to apply preset',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Animated Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 text-white shadow-2xl transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-red-600 via-orange-600 to-red-700 animate-pulse' 
            : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="text-6xl animate-bounce">
            {isActive ? '💥' : '⚠️'}
          </div>
          <div>
            <h2 className="text-3xl font-black mb-1">
              {isActive ? '🔥 CHAOS MODE ACTIVE' : '⚠️ Chaos Engineering Controls'}
            </h2>
            <p className="text-sm opacity-90">
              {isActive 
                ? 'System is under controlled failure conditions - Monitor Health Dashboard!'
                : 'Simulate real-world failures to test system resilience'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-xl shadow-lg ${
              message.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            <p className="text-lg font-bold text-center">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Presets - Featured */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-black text-gray-900 mb-2">⚡ Quick Presets</h2>
          <p className="text-gray-600 mb-6 text-sm">One-click chaos configurations for instant demo</p>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyPreset('mild')}
              disabled={loading}
              className="w-full text-left p-5 border-3 rounded-xl transition-all bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 hover:border-yellow-500 hover:shadow-lg disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">🟡 Mild Chaos</h3>
                  <p className="text-sm text-gray-700">
                    2s latency, 10% crash rate, 5% partial failures
                  </p>
                </div>
                <div className="text-3xl ml-4">→</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyPreset('moderate')}
              disabled={loading}
              className="w-full text-left p-5 border-3 rounded-xl transition-all bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 hover:border-orange-500 hover:shadow-lg disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">🟠 Moderate Chaos</h3>
                  <p className="text-sm text-gray-700">
                    5s latency, 30% crash rate, 20% partial failures
                  </p>
                </div>
                <div className="text-3xl ml-4">→</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyPreset('extreme')}
              disabled={loading}
              className="w-full text-left p-5 border-3 rounded-xl transition-all bg-gradient-to-r from-red-50 to-red-100 border-red-300 hover:border-red-500 hover:shadow-lg disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">🔴 Extreme Chaos</h3>
                  <p className="text-sm text-gray-700">
                    10s latency, 50% crash rate, 30% partial failures
                  </p>
                </div>
                <div className="text-3xl ml-4">→</div>
              </div>
            </motion.button>
          </div>

          {/* Disable Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDisable}
            disabled={loading}
            className="w-full mt-6 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Processing...' : '✅ Disable All Chaos'}
          </motion.button>
        </motion.div>

        {/* Current Status */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Live Status Card */}
          <div className={`rounded-2xl shadow-xl p-8 transition-all ${
            isActive 
              ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white' 
              : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
          }`}>
            <h2 className="text-2xl font-black mb-6 flex items-center">
              <span className={`w-4 h-4 rounded-full mr-3 animate-pulse ${
                isActive ? 'bg-yellow-300' : 'bg-green-300'
              }`}></span>
              Current Status
            </h2>
            
            {currentConfig ? (
              <div className="space-y-4">
                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Latency:</span>
                    <span className="text-2xl font-black">
                      {currentConfig.latency ? `${currentConfig.latency_ms}ms` : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Crash Rate:</span>
                    <span className="text-2xl font-black">
                      {(currentConfig.crash_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Partial Failure:</span>
                    <span className="text-2xl font-black">
                      {(currentConfig.partial_failure_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading configuration...</p>
              </div>
            )}
          </div>

          {/* Health Dashboard Link */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white cursor-pointer"
            onClick={() => {
              const healthTab = document.querySelector('[data-tab="health"]');
              if (healthTab) healthTab.click();
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">📊 Health Dashboard</h3>
                <p className="text-sm opacity-90">Monitor system health in real-time</p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Advanced Configuration (Collapsible) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-black text-gray-900 mb-6">⚙️ Advanced Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Latency Control */}
          <div className="border-2 border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-bold text-gray-900">
                🐌 Latency
              </label>
              <input
                type="checkbox"
                checked={chaosConfig.latency}
                onChange={(e) => setChaosConfig({ ...chaosConfig, latency: e.target.checked })}
                className="h-6 w-6 text-blue-600 rounded"
              />
            </div>
            {chaosConfig.latency && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Delay: {chaosConfig.latency_ms}ms
                </label>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="1000"
                  value={chaosConfig.latency_ms}
                  onChange={(e) => setChaosConfig({ ...chaosConfig, latency_ms: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gradient-to-r from-green-200 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Crash Rate Control */}
          <div className="border-2 border-gray-200 rounded-xl p-5">
            <label className="block text-lg font-bold text-gray-900 mb-4">
              💥 Crash Rate: {(chaosConfig.crash_rate * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={chaosConfig.crash_rate}
              onChange={(e) => setChaosConfig({ ...chaosConfig, crash_rate: parseFloat(e.target.value) })}
              className="w-full h-3 bg-gradient-to-r from-green-200 to-red-500 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">
              Probability of 500 errors
            </p>
          </div>

          {/* Partial Failure Rate Control */}
          <div className="border-2 border-gray-200 rounded-xl p-5">
            <label className="block text-lg font-bold text-gray-900 mb-4">
              🎭 Partial: {(chaosConfig.partial_failure_rate * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={chaosConfig.partial_failure_rate}
              onChange={(e) => setChaosConfig({ ...chaosConfig, partial_failure_rate: parseFloat(e.target.value) })}
              className="w-full h-3 bg-gradient-to-r from-green-200 to-red-500 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">
              Schrödinger's Warehouse
            </p>
          </div>
        </div>

        {/* Apply Custom Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          disabled={loading}
          className="w-full mt-6 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Applying Configuration...' : '🔥 Apply Custom Configuration'}
        </motion.button>
      </motion.div>

      {/* Enhanced Demo Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-start space-x-4">
          <div className="text-5xl">💡</div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-blue-900 mb-4">
              Presentation Demo Flow
            </h3>
            <ol className="space-y-3 text-base text-blue-900">
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">1.</span>
                <span>Open the <strong>Health Dashboard</strong> tab (or split view for side-by-side comparison)</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">2.</span>
                <span>Show <span className="text-green-600 font-bold">normal operations</span> - green status indicators, fast response times (~50ms)</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">3.</span>
                <span>Click <strong>"🟠 Moderate Chaos"</strong> preset button above</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">4.</span>
                <span>Watch the Health Dashboard turn <span className="text-red-600 font-bold">RED</span> with latency spikes (5000ms)</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">5.</span>
                <span>Go to <strong>Orders tab</strong> and create orders - they <strong>still work</strong> thanks to circuit breakers!</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">6.</span>
                <span>Show the <strong>circuit breaker fallback messages</strong> and cached responses</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-3 text-xl">7.</span>
                <span>Click <strong>"✅ Disable All Chaos"</strong> - watch system recover to <span className="text-green-600 font-bold">GREEN</span></span>
              </li>
            </ol>
            
            <div className="mt-6 p-4 bg-white rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> During the demo, emphasize how the system remains functional even under extreme conditions.
                This showcases microservices resilience patterns: circuit breakers, fallbacks, and graceful degradation.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
