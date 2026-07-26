import dotenv from 'dotenv';

dotenv.config();

/**
 * Convierte una variable de entorno a numero y aplica un valor por defecto.
 *
 * @param {string | undefined} value Valor recibido desde el entorno.
 * @param {number} fallback Valor usado cuando la conversion falla.
 * @returns {number} Numero validado.
 */
const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Convierte una variable de entorno textual a booleano.
 *
 * @param {string | undefined} value Valor recibido desde el entorno.
 * @returns {boolean} Verdadero solo cuando el valor es "true".
 */
const toBoolean = (value) => String(value).toLowerCase() === 'true';

/**
 * Configuracion centralizada de la API y de PostgreSQL.
 */
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

/**
 * Indica si la aplicacion se esta ejecutando en modo produccion.
 */
export const isProduction = env.nodeEnv === 'production';
