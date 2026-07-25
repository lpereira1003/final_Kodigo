import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = {
  query: vi.fn(),
  release: vi.fn()
};

vi.mock('../src/config/db.js', () => ({
  getClient: vi.fn(async () => client)
}));

vi.mock('../src/repositories/ventas.repository.js', () => ({
  ventasRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    getNextVentaId: vi.fn(),
    lockProductosByIds: vi.fn(),
    createVenta: vi.fn(),
    createDetalle: vi.fn(),
    descontarStock: vi.fn(),
    devolverStock: vi.fn(),
    lockVentaById: vi.fn(),
    findDetallesByVentaId: vi.fn(),
    updateEstadoVenta: vi.fn()
  }
}));

const { ventasRepository } = await import('../src/repositories/ventas.repository.js');
const { ventasService } = await import('../src/services/ventas.service.js');

describe('ventasService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.query.mockResolvedValue({});
  });

  it('calcula subtotal y total con precio_venta de PostgreSQL', async () => {
    ventasRepository.lockProductosByIds.mockResolvedValue([
      { id: 1, codigo: 'MAR-001', precio_venta: 10.5, stock: 5, activo: true },
      { id: 2, codigo: 'CLA-001', precio_venta: 2.25, stock: 10, activo: true }
    ]);
    ventasRepository.getNextVentaId.mockResolvedValue(7);
    ventasRepository.createVenta.mockImplementation(async (data) => ({
      id: data.id,
      numero_venta: data.numero_venta,
      subtotal: data.subtotal,
      total: data.total,
      estado: 'COMPLETADA'
    }));
    ventasRepository.createDetalle.mockImplementation(async (data) => ({ id: 1, ...data }));
    ventasRepository.descontarStock.mockResolvedValue();

    const venta = await ventasService.create([
      { producto_id: 1, cantidad: 2 },
      { producto_id: 2, cantidad: 3 }
    ]);

    expect(venta.subtotal).toBe(27.75);
    expect(venta.total).toBe(27.75);
    expect(venta.numero_venta).toMatch(/^VTA-\d{4}-000007$/);
    expect(client.query).toHaveBeenCalledWith('BEGIN');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
  });

  it('rechaza venta por stock insuficiente y ejecuta rollback', async () => {
    ventasRepository.lockProductosByIds.mockResolvedValue([
      { id: 1, codigo: 'MAR-001', precio_venta: 10, stock: 1, activo: true }
    ]);

    await expect(ventasService.create([{ producto_id: 1, cantidad: 2 }])).rejects.toMatchObject({
      statusCode: 409
    });

    expect(client.query).toHaveBeenCalledWith('BEGIN');
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(ventasRepository.createVenta).not.toHaveBeenCalled();
  });

  it('ejecuta rollback cuando falla una operación dentro de la transacción', async () => {
    ventasRepository.lockProductosByIds.mockResolvedValue([
      { id: 1, codigo: 'MAR-001', precio_venta: 10, stock: 5, activo: true }
    ]);
    ventasRepository.getNextVentaId.mockResolvedValue(8);
    ventasRepository.createVenta.mockRejectedValue(new Error('insert failed'));

    await expect(ventasService.create([{ producto_id: 1, cantidad: 1 }])).rejects.toThrow('insert failed');

    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });

  it('anula venta y devuelve stock', async () => {
    ventasRepository.lockVentaById.mockResolvedValue({
      id: 9,
      numero_venta: 'VTA-2026-000009',
      estado: 'COMPLETADA'
    });
    ventasRepository.findDetallesByVentaId.mockResolvedValue([
      { id: 1, venta_id: 9, producto_id: 1, cantidad: 2, precio_unitario: 10, subtotal: 20 }
    ]);
    ventasRepository.devolverStock.mockResolvedValue();
    ventasRepository.updateEstadoVenta.mockResolvedValue({
      id: 9,
      numero_venta: 'VTA-2026-000009',
      estado: 'ANULADA',
      subtotal: 20,
      total: 20
    });

    const venta = await ventasService.anular(9);

    expect(ventasRepository.devolverStock).toHaveBeenCalledWith(1, 2, client);
    expect(ventasRepository.updateEstadoVenta).toHaveBeenCalledWith(9, 'ANULADA', client);
    expect(venta.estado).toBe('ANULADA');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
  });
});
