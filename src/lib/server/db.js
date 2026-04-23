/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

let pool;
let hasLoadedDatabaseEnv = false;
const requiredDatabaseEnvNames = ['DB_HOST', 'DB_USER', 'DB_PASSWORD'];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const envText = fs.readFileSync(filePath, 'utf8');

  envText.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });
}

function ensureDatabaseEnvLoaded() {
  if (hasLoadedDatabaseEnv) {
    return;
  }

  hasLoadedDatabaseEnv = true;

  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, '.env.local'));
  loadEnvFile(path.join(cwd, '.env'));
}

function getRequiredEnv(name) {
  ensureDatabaseEnvLoaded();
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function hasDatabaseConfig() {
  ensureDatabaseEnvLoaded();
  return requiredDatabaseEnvNames.every((name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

export function getMissingDatabaseEnvNames() {
  ensureDatabaseEnvLoaded();
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
  const [rows] = await db.query(sql, params);
  return rows;
}
