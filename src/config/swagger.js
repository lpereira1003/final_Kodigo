import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi.js';

/**
 * Registra la interfaz Swagger UI en la aplicacion Express.
 *
 * @param {import('express').Express} app Instancia de Express.
 * @returns {void}
 */
export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};
