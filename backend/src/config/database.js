const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === 'production';
const isRemoteDb = Boolean(
  connectionString &&
  (connectionString.includes('supabase.co') ||
   connectionString.includes('supabase.com') ||
   connectionString.includes('pooler.supabase.com') ||
   connectionString.includes('neon.tech') ||
   connectionString.includes('aws') ||
   connectionString.includes('render.com'))
);

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: isProduction || isRemoteDb ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

// Pool error listener
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Execute parameterized query
 * @param {string} text - SQL Query
 * @param {Array} params - Query Parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SQL Query] (${duration}ms):`, text.replace(/\s+/g, ' ').trim().slice(0, 100));
    }
    return res;
  } catch (err) {
    console.error('[SQL Error]:', err.message, 'Query:', text);
    throw err;
  }
};

/**
 * Get dedicated client for transactions
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = async () => {
  const client = await pool.connect();
  await client.query('SET search_path TO women_skill_portal, public;');
  return client;
};

/**
 * Initialize database schema and verify connection
 */
const initDatabase = async () => {
  try {
    const checkRes = await query('SELECT NOW() as current_time');
    console.log(`Connected to PostgreSQL database at ${checkRes.rows[0].current_time}`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('Database schema women_skill_portal verified/initialized successfully.');
    }
  } catch (err) {
    console.error('Database connection/initialization warning:', err.message);
    console.error('Please ensure your DATABASE_URL in backend/.env is set correctly.');
  }
};

module.exports = {
  pool,
  query,
  getClient,
  initDatabase,
};
