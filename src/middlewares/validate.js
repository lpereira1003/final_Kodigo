/**
 * Valida body, params y query con un schema Zod antes de llegar al controlador.
 *
 * @param {import('zod').ZodType} schema Schema de validacion.
 * @returns {import('express').RequestHandler} Middleware de validacion.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  req.validated = result.data;
  return next();
};
