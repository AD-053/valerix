const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    logger.error('Redis reconnect on error', { error: err.message });
    return true;
  },
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

// Health check function - verifies Redis connectivity
const checkRedisHealth = async () => {
  try {
    // Check connectivity with timeout
    const pingPromise = redis.ping();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis ping timeout')), 2000)
    );
    
    await Promise.race([pingPromise, timeoutPromise]);
    
    // Try a simple test operation (non-critical)
    try {
      const testKey = `health:${Date.now()}`;
      await redis.set(testKey, '1', 'EX', 5);
      await redis.del(testKey);
      
      return { 
        healthy: true,
        details: {
          ping: 'ok',
          operations: 'ok'
        }
      };
    } catch (opError) {
      // Ping worked but operations failed - still consider healthy
      logger.warn('Redis operations warning', { error: opError.message });
      return { 
        healthy: true,
        details: {
          ping: 'ok',
          operations: 'degraded'
        }
      };
    }
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return { 
      healthy: false, 
      error: error.message,
      details: {
        ping: 'failed',
        operations: 'unknown'
      }
    };
  }
};

module.exports = {
  redis,
  checkRedisHealth,
};
