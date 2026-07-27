import { env } from '../config/env.js';

/**
 * Respuestas de error reutilizables para los endpoints documentados.
 */
const errorResponses = {
  400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
  404: { description: 'Recurso no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
  409: { description: 'Conflicto de negocio', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
  500: { description: 'Error inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
};

const servers = env.nodeEnv === 'production'
  ? [{ url: 'http://138.68.11.235:3001', description: 'Servidor DigitalOcean' }]
  : [{ url: `http://localhost:${env.port}`, description: 'Servidor local' }];

/**
 * Especificacion OpenAPI 3.0 expuesta en Swagger UI.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Mini Tienda Hardware API',
    version: env.apiVersion,
    description: 'API REST para productos y ventas de una mini tienda de hardware.'
  },
  servers,
  tags: [{ name: 'Health' }, { name: 'Productos' }, { name: 'Ventas' }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Comprueba el estado de la API y PostgreSQL',
        responses: {
          200: { description: 'Servicio saludable' },
          503: { description: 'PostgreSQL no responde' }
        }
      }
    },
    '/api/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Lista productos con filtros y paginación',
        parameters: [
          { name: 'nombre', in: 'query', schema: { type: 'string' } },
          { name: 'codigo', in: 'query', schema: { type: 'string' } },
          { name: 'activo', in: 'query', schema: { type: 'boolean' } },
          { name: 'stock', in: 'query', schema: { type: 'integer', minimum: 0 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } }
        ],
        responses: { 200: { description: 'Listado de productos' }, ...errorResponses }
      },
      post: {
        tags: ['Productos'],
        summary: 'Crea un producto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductoInput' },
              example: {
                codigo: 'TAL-001',
                nombre: 'Taladro percutor',
                descripcion: 'Taladro de 1/2 pulgada',
                precio_compra: 45.5,
                precio_venta: 69.99,
                stock: 20,
                activo: true
              }
            }
          }
        },
        responses: { 201: { description: 'Producto creado' }, ...errorResponses }
      }
    },
    '/api/productos/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Obtiene un producto por ID',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: { 200: { description: 'Producto encontrado' }, ...errorResponses }
      },
      put: {
        tags: ['Productos'],
        summary: 'Actualiza un producto completo',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductoInput' } } }
        },
        responses: { 200: { description: 'Producto actualizado' }, ...errorResponses }
      }
    },
    '/api/productos/{id}/estado': {
      patch: {
        tags: ['Productos'],
        summary: 'Actualiza el estado activo/inactivo de un producto',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { activo: { type: 'boolean' } }, required: ['activo'] }, example: { activo: false } } }
        },
        responses: { 200: { description: 'Estado actualizado' }, ...errorResponses }
      }
    },
    '/api/ventas': {
      post: {
        tags: ['Ventas'],
        summary: 'Registra una venta dentro de una transacción',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VentaInput' },
              example: { items: [{ producto_id: 1, cantidad: 2 }] }
            }
          }
        },
        responses: { 201: { description: 'Venta registrada' }, ...errorResponses }
      },
      get: {
        tags: ['Ventas'],
        summary: 'Lista ventas',
        parameters: [
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['COMPLETADA', 'ANULADA'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } }
        ],
        responses: { 200: { description: 'Listado de ventas' }, ...errorResponses }
      }
    },
    '/api/ventas/{id}': {
      get: {
        tags: ['Ventas'],
        summary: 'Obtiene una venta con detalle',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: { 200: { description: 'Venta encontrada' }, ...errorResponses }
      }
    },
    '/api/ventas/{id}/anular': {
      patch: {
        tags: ['Ventas'],
        summary: 'Anula una venta y devuelve stock',
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: { 200: { description: 'Venta anulada' }, ...errorResponses }
      }
    }
  },
  components: {
    parameters: {
      IdPath: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 }
      }
    },
    schemas: {
      Producto: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          codigo: { type: 'string' },
          nombre: { type: 'string' },
          descripcion: { type: 'string', nullable: true },
          precio_compra: { type: 'number' },
          precio_venta: { type: 'number' },
          stock: { type: 'integer' },
          activo: { type: 'boolean' },
          fecha_creacion: { type: 'string', format: 'date-time' },
          fecha_actualizacion: { type: 'string', format: 'date-time' }
        }
      },
      ProductoInput: {
        type: 'object',
        required: ['codigo', 'nombre', 'precio_compra', 'precio_venta', 'stock'],
        properties: {
          codigo: { type: 'string', maxLength: 30 },
          nombre: { type: 'string', maxLength: 120 },
          descripcion: { type: 'string', maxLength: 255, nullable: true },
          precio_compra: { type: 'number', minimum: 0.01 },
          precio_venta: { type: 'number', minimum: 0.01 },
          stock: { type: 'integer', minimum: 0 },
          activo: { type: 'boolean', default: true }
        }
      },
      DetalleVenta: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          venta_id: { type: 'integer', format: 'int64' },
          producto_id: { type: 'integer', format: 'int64' },
          cantidad: { type: 'integer' },
          precio_unitario: { type: 'number' },
          subtotal: { type: 'number' }
        }
      },
      Venta: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          numero_venta: { type: 'string', example: 'VTA-2026-000001' },
          fecha_venta: { type: 'string', format: 'date-time' },
          subtotal: { type: 'number' },
          total: { type: 'number' },
          estado: { type: 'string', enum: ['COMPLETADA', 'ANULADA'] },
          detalles: { type: 'array', items: { $ref: '#/components/schemas/DetalleVenta' } }
        }
      },
      VentaInput: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['producto_id', 'cantidad'],
              properties: {
                producto_id: { type: 'integer', minimum: 1 },
                cantidad: { type: 'integer', minimum: 1 }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  }
};
