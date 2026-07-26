/**
 * Envuelve controladores asincronos y reenvia errores al middleware central.
 *
 * @param {Function} handler Controlador Express asincrono.
 * @returns {Function} Middleware Express.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
