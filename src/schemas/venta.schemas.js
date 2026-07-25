import { z } from 'zod';
import { idParamSchema, paginationQuerySchema } from './common.schemas.js';

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

export const listVentasSchema = z.object({
  query: paginationQuerySchema.extend({
    estado: z.enum(['COMPLETADA', 'ANULADA']).optional()
  })
});

export const getVentaSchema = idParamSchema;

export const anularVentaSchema = idParamSchema;
