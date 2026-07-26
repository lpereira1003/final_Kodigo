import { z } from 'zod';
import { idParamSchema, paginationQuerySchema } from './common.schemas.js';

/**
 * Valida el cuerpo requerido para registrar una venta.
 */
export const createVentaSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          producto_id: z.coerce.number().int().positive(),
          cantidad: z.coerce.number().int().positive()
        })
      )
      .min(1, 'La venta debe incluir al menos un producto')
  })
});

/**
 * Valida filtros opcionales y paginacion para listar ventas.
 */
export const listVentasSchema = z.object({
  query: paginationQuerySchema.extend({
    estado: z.enum(['COMPLETADA', 'ANULADA']).optional()
  })
});

/**
 * Valida el identificador de venta recibido por ruta.
 */
export const getVentaSchema = idParamSchema;

/**
 * Valida el identificador de venta para anularla.
 */
export const anularVentaSchema = idParamSchema;
