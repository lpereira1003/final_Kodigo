import { env } from '../config/env.js';
import { query } from '../config/db.js';

/**
 * Comprueba disponibilidad de la API y conectividad basica con PostgreSQL.
 *
 * @param {import('express').Request} req Solicitud Express.
 * @param {import('express').Response} res Respuesta Express.
 * @returns {Promise<import('express').Response>} Respuesta de estado del servicio.
 */
export const healthCheck = async (req, res) => {
  try {
    await query('SELECT 1');

    return res.status(200).json({
      success: true,
      message: 'API activa',
      data: {
        database: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
        apiVersion: env.apiVersion
      }
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'La API está activa, pero PostgreSQL no responde',
      errors: [],
      data: {
        database: 'unavailable',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
        apiVersion: env.apiVersion
      }
    });
  }
};
