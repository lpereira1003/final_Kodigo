import { z } from 'zod';

/**
 * Schema reutilizable para validar parametros de ruta con identificador positivo.
 */
export const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});

/**
 * Schema reutilizable para paginacion por query string.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});
