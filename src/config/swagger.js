import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi.js';

/**
 * Registra la interfaz Swagger UI en la aplicacion Express.
 *
 * @param {import('express').Express} app Instancia de Express.
 * @returns {void}
 */
export const setupSwagger = (app) => {
  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};
