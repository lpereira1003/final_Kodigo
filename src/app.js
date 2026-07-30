import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { setupSwagger } from './config/swagger.js';
import { healthRouter } from './routes/health.routes.js';
import { productosRouter } from './routes/productos.routes.js';
import { ventasRouter } from './routes/ventas.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { successResponse } from './utils/responses.js';

/**
 * Construye y configura la aplicacion Express con seguridad, rutas y errores.
 *
 * @returns {import('express').Express} Aplicacion Express lista para servir.
 */
export const createApp = () => {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  setupSwagger(app);
  app.get('/', (_req, res) => successResponse(res, 200, 'Mini Tienda Hardware API REST operativa', {
    project: 'Mini Tienda Hardware API REST',
    description: 'API REST para la gestión de productos, ventas y detalle de ventas.',
    version: env.apiVersion,
    environment: env.nodeEnv,
    documentation: '/api-docs/',
    health: '/health',
    resources: {
      productos: '/api/productos',
      ventas: '/api/ventas'
    }
  }));
  app.use(healthRouter);
  app.use(productosRouter);
  app.use(ventasRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
