import { Pool, PoolClient, QueryResult, PoolConfig } from 'pg';
import dotenv from 'dotenv';

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

const poolConfig: PoolConfig = connectionString
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

export const pool = new Pool(poolConfig);

// Pool error listener
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Execute parameterized query
 * @param text - SQL Query
 * @param params - Query Parameters
 */
export const query = async <T extends import('pg').QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SQL Query] (${duration}ms):`, text.replace(/\s+/g, ' ').trim().slice(0, 100));
    }
    return res;
  } catch (err: any) {
    console.error('[SQL Error]:', err.message, 'Query:', text);
    throw err;
  }
};

/**
 * Get dedicated client for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  await client.query('SET search_path TO women_skill_portal, public;');
  return client;
};

/**
 * Verify active connection to Supabase PostgreSQL database
 */
export const initDatabase = async (): Promise<void> => {
  try {
    const checkRes = await query<{ current_time: string }>('SELECT NOW() as current_time');
    console.log(`✅ Connected successfully to Supabase PostgreSQL at ${checkRes.rows[0].current_time}`);
  } catch (err: any) {
    console.error('❌ Supabase database connection failed:', err.message);
    console.error('Please ensure your DATABASE_URL in backend/.env is set correctly.');
  }
};
