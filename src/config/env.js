import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value) => String(value).toLowerCase() === 'true';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 3000),
  apiVersion: process.env.API_VERSION || '1.0.0',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || 'mini_tienda_db',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    ssl: toBoolean(process.env.DB_SSL) ? { rejectUnauthorized: false } : false
  }
};

export const isProduction = env.nodeEnv === 'production';
