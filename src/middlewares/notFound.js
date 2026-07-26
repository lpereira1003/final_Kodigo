/**
 * Responde de forma consistente cuando una ruta no existe.
 *
 * @param {import('express').Request} req Solicitud Express.
 * @param {import('express').Response} res Respuesta Express.
 * @returns {void}
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    errors: []
  });
};
