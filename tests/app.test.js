import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/db.js', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
  closePool: vi.fn()
}));

const { query } = await import('../src/config/db.js');
const { createApp } = await import('../src/app.js');

describe('API base', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /health responde 200 cuando PostgreSQL responde', async () => {
    query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe('ok');
  });

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

  it('rechaza venta sin items', async () => {
    const response = await request(app).post('/api/ventas').send({ items: [] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
