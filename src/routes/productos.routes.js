import { Router } from 'express';
import { productosController } from '../controllers/productos.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProductoSchema,
  getProductoSchema,
  listProductosSchema,
  updateProductoEstadoSchema,
  updateProductoSchema
} from '../schemas/producto.schemas.js';

/**
 * Router de endpoints REST para productos.
 */
export const productosRouter = Router();

/**
 * Lista productos con filtros opcionales y paginacion.
 */
productosRouter.get('/api/productos', validate(listProductosSchema), asyncHandler(productosController.list));
/**
 * Obtiene un producto por identificador.
 */
productosRouter.get('/api/productos/:id', validate(getProductoSchema), asyncHandler(productosController.getById));
/**
 * Crea un producto.
 */
productosRouter.post('/api/productos', validate(createProductoSchema), asyncHandler(productosController.create));
/**
 * Actualiza un producto.
 */
productosRouter.put('/api/productos/:id', validate(updateProductoSchema), asyncHandler(productosController.update));
/**
 * Cambia el estado logico del producto.
 */
productosRouter.patch('/api/productos/:id/estado',
  validate(updateProductoEstadoSchema),
  asyncHandler(productosController.updateEstado)
);
