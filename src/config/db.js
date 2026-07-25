import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool(env.db);

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export const closePool = async () => {
  await pool.end();
};
