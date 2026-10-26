import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;
let isConnected = false;

export function getDbConfig() {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'omniserve';
  const password = process.env.MYSQL_PASSWORD || 'omniserve_secure_password';
  const database = process.env.MYSQL_DATABASE || 'omniserve_db';

  return { host, port, user, password, database };
}

export async function initDbPool(): Promise<Pool | null> {
  if (pool) return pool;

  try {
    const config = getDbConfig();
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log(`[MySQL] Connected successfully to ${config.database}@${config.host}:${config.port}`);
    return pool;
  } catch (err: any) {
    console.warn(`[MySQL] Real MySQL connection not available (${err.message}). Using resilient API handler.`);
    isConnected = false;
    return null;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const p = await initDbPool();
  if (!p) {
    throw new Error('MySQL pool is not connected');
  }
  const [rows] = await p.execute(sql, params);
  return rows as T[];
}
