/**
 * Error operacional con codigo HTTP y detalles serializables para la API.
 */
export class AppError extends Error {
  /**
   * Crea un error controlado de aplicacion.
   *
   * @param {string} message Mensaje legible para el cliente.
   * @param {number} [statusCode=500] Codigo HTTP asociado.
   * @param {unknown[]} [errors=[]] Detalles adicionales del error.
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}
