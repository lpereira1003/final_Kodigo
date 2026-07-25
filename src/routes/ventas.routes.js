import { Router } from 'express';
import { ventasController } from '../controllers/ventas.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  anularVentaSchema,
  createVentaSchema,
  getVentaSchema,
  listVentasSchema
} from '../schemas/venta.schemas.js';

export const ventasRouter = Router();

ventasRouter.post('/api/ventas', validate(createVentaSchema), asyncHandler(ventasController.create));
ventasRouter.get('/api/ventas', validate(listVentasSchema), asyncHandler(ventasController.list));
ventasRouter.get('/api/ventas/:id', validate(getVentaSchema), asyncHandler(ventasController.getById));
ventasRouter.patch('/api/ventas/:id/anular', validate(anularVentaSchema), asyncHandler(ventasController.anular));
