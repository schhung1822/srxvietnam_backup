import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

let pool;
let hasLoadedDatabaseEnv = false;
const databaseUrlEnvNames = ['DATABASE_URL', 'MYSQL_URL', 'DB_URL'];
const requiredDatabaseEnvNames = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

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

function getDatabaseUrl() {
  ensureDatabaseEnvLoaded();

  for (const name of databaseUrlEnvNames) {
    const value = process.env[name];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
}

function parseBooleanEnv(name, fallbackValue = false) {
  ensureDatabaseEnvLoaded();
  const value = process.env[name];

  if (typeof value !== 'string' || !value.trim()) {
    return fallbackValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function getSslConfig() {
  if (!parseBooleanEnv('DB_SSL', false)) {
    return undefined;
  }

  return {
    rejectUnauthorized: parseBooleanEnv('DB_SSL_REJECT_UNAUTHORIZED', false),
  };
}

function buildConnectionConfigFromUrl(databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));

  if (!databaseName) {
    throw new Error('Missing database name in DATABASE_URL/MYSQL_URL/DB_URL');
  }

  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 3306),
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: databaseName,
    ssl: getSslConfig(),
  };
}

export function hasDatabaseConfig() {
  ensureDatabaseEnvLoaded();
  if (getDatabaseUrl()) {
    return true;
  }

  return requiredDatabaseEnvNames.every((name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

export function getMissingDatabaseEnvNames() {
  ensureDatabaseEnvLoaded();
  if (getDatabaseUrl()) {
    return [];
  }

  return requiredDatabaseEnvNames.filter((name) => {
    const value = process.env[name];
    return !(typeof value === 'string' && value.trim().length > 0);
  });
}

export function getDbPool() {
  if (!pool) {
    const databaseUrl = getDatabaseUrl();
    const baseConfig = databaseUrl
      ? buildConnectionConfigFromUrl(databaseUrl)
      : {
          host: getRequiredEnv('DB_HOST'),
          port: Number(process.env.DB_PORT ?? 3306),
          user: getRequiredEnv('DB_USER'),
          password: getRequiredEnv('DB_PASSWORD'),
          database: getRequiredEnv('DB_NAME'),
          ssl: getSslConfig(),
        };

    pool = mysql.createPool({
      ...baseConfig,
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
