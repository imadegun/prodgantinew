import mysql from 'mysql2/promise';

const MYSQL_HOST = process.env.GAYAFUSION_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.GAYAFUSION_PORT || '3306');
const MYSQL_USER = process.env.GAYAFUSION_USER || 'root';
const MYSQL_PASSWORD = process.env.GAYAFUSION_PASSWORD || 'root';
const MYSQL_DATABASE = process.env.GAYAFUSION_DATABASE || 'gayafusionall';

let pool: mysql.Pool | null;

export interface GayafusionProduct {
  id: number;
  product_code: string;
  product_name: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  final_size: string;
  clay_type: string;
  clay_quantity: number;
  glaze: string;
  engobe: string;
  luster: string;
  stains_oxides: string;
  casting_tools: string;
  extruders: string;
  textures: string;
  general_tools: string;
  build_notes: string;
}

/**
 * Initialize MySQL connection pool
 */
export async function initializeMySQL(): Promise<void> {
  if (pool) {
    return;
  }

  try {
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      keepAlive: 10000,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('MySQL connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to MySQL:', error);
    throw error;
  }
}

/**
 * Get MySQL connection pool
 */
export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    throw new Error('MySQL pool not initialized. Call initializeMySQL() first.');
  }
  return pool;
}

/**
 * Close MySQL connection pool
 */
export async function closeMySQL(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('MySQL connection closed');
    } catch (error) {
      console.error('Error closing MySQL connection:', error);
      throw error;
    }
  }
}

/**
 * Map database row to GayafusionProduct interface
 */
function mapRowToProduct(row: any): GayafusionProduct {
  return {
    id: row.id,
    product_code: row.product_code,
    product_name: row.product_name,
    color: row.color,
    texture: row.texture,
    material: row.material,
    size: row.size,
    final_size: row.final_size,
    clay_type: row.clay_type,
    clay_quantity: row.clay_quantity,
    glaze: row.glaze,
    engobe: row.engobe,
    luster: row.luster,
    stains_oxides: row.stains_oxides,
    casting_tools: row.casting_tools,
    extruders: row.extruders,
    textures: row.textures,
    general_tools: row.general_tools,
    build_notes: row.build_notes,
  };
}

/**
 * Parse comma-separated string to array
 */
function parseCSV(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
}