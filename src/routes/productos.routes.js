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

export const productosRouter = Router();

productosRouter.get('/api/productos', validate(listProductosSchema), asyncHandler(productosController.list));
productosRouter.get('/api/productos/:id', validate(getProductoSchema), asyncHandler(productosController.getById));
productosRouter.post('/api/productos', validate(createProductoSchema), asyncHandler(productosController.create));
productosRouter.put('/api/productos/:id', validate(updateProductoSchema), asyncHandler(productosController.update));
productosRouter.patch(
  '/api/productos/:id/estado',
  validate(updateProductoEstadoSchema),
  asyncHandler(productosController.updateEstado)
);
