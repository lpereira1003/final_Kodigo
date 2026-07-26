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

/**
 * Router de endpoints REST para ventas.
 */
export const ventasRouter = Router();

/**
 * Registra una venta con transaccion PostgreSQL.
 */
ventasRouter.post('/api/ventas', validate(createVentaSchema), asyncHandler(ventasController.create));
/**
 * Lista ventas con filtros opcionales y paginacion.
 */
ventasRouter.get('/api/ventas', validate(listVentasSchema), asyncHandler(ventasController.list));
/**
 * Obtiene una venta por identificador.
 */
ventasRouter.get('/api/ventas/:id', validate(getVentaSchema), asyncHandler(ventasController.getById));
/**
 * Anula una venta y devuelve stock.
 */
ventasRouter.patch('/api/ventas/:id/anular', validate(anularVentaSchema), asyncHandler(ventasController.anular));
