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
    await initAllTables();
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

export async function initAllTables() {
  if (!isConnected) return;
  try {
    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`phone\` VARCHAR(50) NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(30) NOT NULL DEFAULT 'customer',
        \`avatar\` TEXT NULL,
        \`address\` TEXT NULL,
        \`wallet_balance\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        \`status\` VARCHAR(30) NOT NULL DEFAULT 'active',
        \`provider_category\` VARCHAR(50) NULL,
        \`service_skill\` VARCHAR(150) NULL,
        \`vehicle_type\` VARCHAR(150) NULL,
        \`rating\` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
        \`completed_jobs_count\` INT NOT NULL DEFAULT 0,
        \`is_online\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_user_email\` (\`email\`),
        INDEX \`idx_user_phone\` (\`phone\`),
        INDEX \`idx_user_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Orders Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`category\` VARCHAR(50) NOT NULL,
        \`customer_id\` VARCHAR(64) NOT NULL,
        \`customer_name\` VARCHAR(150) NOT NULL,
        \`customer_phone\` VARCHAR(50) NOT NULL,
        \`delivery_address\` TEXT NOT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`pricing_base\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`pricing_service_delivery\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`pricing_item_budget\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`pricing_helper\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`pricing_platform\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`pricing_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'cod',
        \`payment_status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`assigned_provider_id\` VARCHAR(64) NULL,
        \`assigned_provider_name\` VARCHAR(150) NULL,
        \`assigned_provider_phone\` VARCHAR(50) NULL,
        \`assigned_provider_avatar\` TEXT NULL,
        \`assigned_provider_rating\` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
        \`eta_minutes\` INT NOT NULL DEFAULT 25,
        \`current_step_index\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_order_cust\` (\`customer_id\`),
        INDEX \`idx_order_prov\` (\`assigned_provider_id\`),
        INDEX \`idx_order_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Settings Table (Rates, WhatsApp Phone, Commission, etc.)
    await query(`
      CREATE TABLE IF NOT EXISTS \`app_settings\` (
        \`id\` VARCHAR(32) NOT NULL PRIMARY KEY,
        \`delivery_base_fee\` DECIMAL(10,2) NOT NULL DEFAULT 200.00,
        \`delivery_per_km_fee\` DECIMAL(10,2) NOT NULL DEFAULT 35.00,
        \`delivery_urgent_fee\` DECIMAL(10,2) NOT NULL DEFAULT 150.00,
        \`technician_visiting_fee\` DECIMAL(10,2) NOT NULL DEFAULT 500.00,
        \`technician_hourly_rate\` DECIMAL(10,2) NOT NULL DEFAULT 800.00,
        \`platform_commission_rate\` DECIMAL(5,2) NOT NULL DEFAULT 15.00,
        \`platform_fixed_fee\` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
        \`whatsapp_support_phone\` VARCHAR(50) NOT NULL DEFAULT '+92 308 4541241',
        \`whatsapp_default_message\` TEXT NULL,
        \`support_helpline\` VARCHAR(50) NOT NULL DEFAULT '+92 308 4541241',
        \`raw_json\` LONGTEXT NULL,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Catalog Services Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`catalog_services\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`base_price\` DECIMAL(10,2) NOT NULL,
        \`estimated_duration\` VARCHAR(100) NULL,
        \`description\` TEXT NULL,
        \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
        \`assigned_provider_id\` VARCHAR(64) NULL,
        \`assigned_provider_name\` VARCHAR(150) NULL,
        \`raw_json\` LONGTEXT NULL,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Catalog Vehicles Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`catalog_vehicles\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`capacity_kg\` INT NOT NULL DEFAULT 500,
        \`dimensions\` VARCHAR(100) NULL,
        \`base_fare\` DECIMAL(10,2) NOT NULL,
        \`per_km_rate\` DECIMAL(10,2) NOT NULL,
        \`helper_rate\` DECIMAL(10,2) NOT NULL DEFAULT 400.00,
        \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
        \`assigned_provider_id\` VARCHAR(64) NULL,
        \`assigned_provider_name\` VARCHAR(150) NULL,
        \`raw_json\` LONGTEXT NULL,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. System Snapshots Table (Zero-Loss Persistent Backup & Cache)
    await query(`
      CREATE TABLE IF NOT EXISTS \`system_snapshots\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`snapshot_label\` VARCHAR(150) NOT NULL,
        \`orders_count\` INT NOT NULL DEFAULT 0,
        \`users_count\` INT NOT NULL DEFAULT 0,
        \`snapshot_json\` LONGTEXT NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_snap_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[MySQL] All database tables (users, orders, app_settings, catalog_services, catalog_vehicles, system_snapshots) verified.');
  } catch (err: any) {
    console.warn('[MySQL] Note verifying schema tables:', err.message);
  }
}
