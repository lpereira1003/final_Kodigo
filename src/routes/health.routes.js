import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { healthCheck } from '../controllers/health.controller.js';

/**
 * Router de endpoints de monitoreo y disponibilidad.
 */
export const healthRouter = Router();

/**
 * Endpoint publico para verificar API y PostgreSQL.
 */
healthRouter.get('/health', asyncHandler(healthCheck));
