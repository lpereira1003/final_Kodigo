import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { healthCheck } from '../controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/health', asyncHandler(healthCheck));
