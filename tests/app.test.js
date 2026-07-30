import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Mock de la capa PostgreSQL para probar endpoints sin base de datos real.
 */
vi.mock('../src/config/db.js', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
  closePool: vi.fn()
}));

const { query } = await import('../src/config/db.js');
const { createApp } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');

/**
 * Pruebas HTTP basicas de health check y validaciones de entrada.
 */
describe('API base', () => {
  const app = createApp();

  /**
   * Limpia los mocks antes de cada caso para aislar resultados.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Valida que la ruta raiz entregue informacion publica de entrada a la API.
   */
  it('GET / responde informacion operativa de la API', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Mini Tienda Hardware API REST operativa',
      data: {
        project: 'Mini Tienda Hardware API REST',
        description: 'API REST para la gestión de productos, ventas y detalle de ventas.',
        version: env.apiVersion,
        environment: env.nodeEnv,
        documentation: '/api-docs/',
        health: '/health',
        resources: {
          productos: '/api/productos',
          ventas: '/api/ventas'
        }
      }
    });
  });

  /**
   * Valida que el health check responda correctamente con PostgreSQL disponible.
   */
  it('GET /health responde 200 cuando PostgreSQL responde', async () => {
    query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe('ok');
  });

  /**
   * Valida que la especificacion OpenAPI este disponible para Swagger UI.
   */
  it('GET /api-docs.json expone la especificacion OpenAPI', async () => {
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info.title).toBe('Mini Tienda Hardware API');
  });

  /**
   * Valida que Zod rechace productos con datos fuera de contrato.
   */
  it('rechaza creación de producto con datos inválidos', async () => {
    const response = await request(app).post('/api/productos').send({
      codigo: '',
      nombre: '',
      precio_compra: -1,
      precio_venta: 0,
      stock: -5
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  /**
   * Valida que una venta sin items no llegue a la capa de negocio.
   */
  it('rechaza venta sin items', async () => {
    const response = await request(app).post('/api/ventas').send({ items: [] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
