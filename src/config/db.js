import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

/**
 * Pool compartido de conexiones PostgreSQL para toda la aplicacion.
 */
export const pool = new Pool(env.db);

/**
 * Ejecuta una consulta SQL parametrizada usando el pool compartido.
 *
 * @param {string} text Consulta SQL con placeholders.
 * @param {unknown[]} [params] Parametros de la consulta.
 * @returns {Promise<import('pg').QueryResult>} Resultado de PostgreSQL.
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente dedicado del pool para operaciones transaccionales.
 *
 * @returns {Promise<import('pg').PoolClient>} Cliente PostgreSQL.
 */
export const getClient = () => pool.connect();

/**
 * Cierra el pool de conexiones durante el apagado ordenado del proceso.
 *
 * @returns {Promise<void>}
 */
export const closePool = async () => {
  await pool.end();
};
