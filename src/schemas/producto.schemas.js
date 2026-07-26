import { z } from 'zod';
import { idParamSchema, paginationQuerySchema } from './common.schemas.js';

/**
 * Valida valores monetarios positivos con dos decimales como maximo.
 */
const moneySchema = z.coerce.number().positive().multipleOf(0.01);

/**
 * Define el contrato del cuerpo para crear o actualizar productos.
 */
const productoBodySchema = z.object({
  codigo: z.string().trim().min(1).max(30),
  nombre: z.string().trim().min(1).max(120),
  descripcion: z.string().trim().max(255).nullable().optional(),
  precio_compra: moneySchema,
  precio_venta: moneySchema,
  stock: z.coerce.number().int().min(0),
  activo: z.boolean().optional().default(true)
});

/**
 * Valida filtros opcionales y paginacion para listar productos.
 */
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

/**
 * Valida el identificador de producto recibido por ruta.
 */
export const getProductoSchema = idParamSchema;

/**
 * Valida el cuerpo requerido para crear productos.
 */
export const createProductoSchema = z.object({
  body: productoBodySchema
});

/**
 * Valida parametros y cuerpo requerido para actualizar productos.
 */
export const updateProductoSchema = z.object({
  params: idParamSchema.shape.params,
  body: productoBodySchema
});

/**
 * Valida el cambio de estado activo/inactivo de un producto.
 */
export const updateProductoEstadoSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    activo: z.boolean()
  })
});
