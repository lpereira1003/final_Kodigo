import { z } from 'zod';
import { idParamSchema, paginationQuerySchema } from './common.schemas.js';

const moneySchema = z.coerce.number().positive().multipleOf(0.01);

const productoBodySchema = z.object({
  codigo: z.string().trim().min(1).max(30),
  nombre: z.string().trim().min(1).max(120),
  descripcion: z.string().trim().max(255).nullable().optional(),
  precio_compra: moneySchema,
  precio_venta: moneySchema,
  stock: z.coerce.number().int().min(0),
  activo: z.boolean().optional().default(true)
});

export const listProductosSchema = z.object({
  query: paginationQuerySchema.extend({
    nombre: z.string().trim().min(1).optional(),
    codigo: z.string().trim().min(1).optional(),
    activo: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    stock: z.coerce.number().int().min(0).optional()
  })
});

export const getProductoSchema = idParamSchema;

export const createProductoSchema = z.object({
  body: productoBodySchema
});

export const updateProductoSchema = z.object({
  params: idParamSchema.shape.params,
  body: productoBodySchema
});

export const updateProductoEstadoSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    activo: z.boolean()
  })
});
