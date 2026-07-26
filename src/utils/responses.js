/**
 * Envia una respuesta JSON exitosa con formato consistente.
 *
 * @param {import('express').Response} res Respuesta Express.
 * @param {number} statusCode Codigo HTTP.
 * @param {string} message Mensaje legible.
 * @param {unknown} [data=null] Datos de respuesta.
 * @param {object | undefined} [meta] Metadatos opcionales.
 * @returns {import('express').Response} Respuesta HTTP.
 */
export const successResponse = (res, statusCode, message, data = null, meta = undefined) => {
  const body = {
    success: true,
    message,
    data
  };

  if (meta) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};
