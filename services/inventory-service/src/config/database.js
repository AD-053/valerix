const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'valerix',
  password: process.env.DB_PASSWORD || 'valerix123',
  database: process.env.DB_NAME || 'inventory_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL error', { error: err.message });
});

pool.on('connect', () => {
  logger.info('PostgreSQL connection established');
});

// Health check function - verifies database connection AND table accessibility
const checkDatabaseHealth = async () => {
  try {
    // Check basic connectivity
    await pool.query('SELECT 1');
    
    // Verify inventory table exists and is queryable
    const tableCheck = await pool.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory'"
    );
    
    if (tableCheck.rows[0].count === '0') {
      throw new Error('Inventory table does not exist');
    }
    
    // Verify we can actually query the inventory table
    const dataCheck = await pool.query('SELECT COUNT(*) FROM inventory LIMIT 1');
    
    return { 
      healthy: true,
      details: {
        connection: 'ok',
        inventory_table: 'accessible',
        item_count: dataCheck.rows[0].count
      }
    };
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return { 
      healthy: false, 
      error: error.message,
      details: {
        connection: error.message.includes('connect') ? 'failed' : 'ok',
        inventory_table: error.message.includes('inventory') ? 'not accessible' : 'unknown'
      }
    };
  }
};

module.exports = {
  pool,
  checkDatabaseHealth,
};
