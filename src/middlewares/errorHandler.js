import { isProduction } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * Traduce errores conocidos de PostgreSQL a errores operacionales de la API.
 *
 * @param {Error & { code?: string }} err Error original.
 * @returns {AppError | null} Error de aplicacion equivalente.
 */
const mapPostgresError = (err) => {
  if (err?.code === '23505') {
    return new AppError('Conflicto de unicidad en la base de datos', 409);
  }

  if (err?.code === '23503') {
    return new AppError('Referencia inválida en la base de datos', 400);
  }

  return null;
};

/**
 * Middleware centralizado de manejo de errores.
 *
 * @param {Error} err Error capturado.
 * @param {import('express').Request} req Solicitud Express.
 * @param {import('express').Response} res Respuesta Express.
 * @param {import('express').NextFunction} next Siguiente middleware.
 * @returns {void}
 */
export const errorHandler = (err, req, res, next) => {
  const mappedError = mapPostgresError(err);
  const error = mappedError || err;
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  const body = {
    success: false,
    message: statusCode === 500 ? 'Error interno del servidor' : error.message,
    errors: error.errors || []
  };

  if (!isProduction && statusCode === 500) {
    body.stack = error.stack;
  }

  res.status(statusCode).json(body);
};
