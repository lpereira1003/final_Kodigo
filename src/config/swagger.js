import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi.js';

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};
