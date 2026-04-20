/* eslint-disable no-undef */
import mysql from 'mysql2/promise';

let pool;
const requiredDatabaseEnvNames = ['DB_HOST', 'DB_USER', 'DB_PASSWORD'];

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function hasDatabaseConfig() {
  return requiredDatabaseEnvNames.every((name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

export function getMissingDatabaseEnvNames() {
  return requiredDatabaseEnvNames.filter((name) => {
    const value = process.env[name];
    return !(typeof value === 'string' && value.trim().length > 0);
  });
}

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: getRequiredEnv('DB_HOST'),
      port: Number(process.env.DB_PORT ?? 3306),
      user: getRequiredEnv('DB_USER'),
      password: getRequiredEnv('DB_PASSWORD'),
      database: process.env.DB_NAME ?? 'srx_beauty_shop',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });
  }

  return pool;
}

export async function query(sql, params = []) {
  const db = getDbPool();
  const [rows] = await db.execute(sql, params);
  return rows;
}
