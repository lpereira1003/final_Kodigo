import { getClient } from '../config/db.js';
import { ventasRepository } from '../repositories/ventas.repository.js';
import { AppError } from '../utils/AppError.js';

const formatNumeroVenta = (id, date = new Date()) => {
  const year = date.getFullYear();
  return `VTA-${year}-${String(id).padStart(6, '0')}`;
};

const normalizeItems = (items) => {
  const grouped = new Map();

  for (const item of items) {
    grouped.set(item.producto_id, (grouped.get(item.producto_id) || 0) + item.cantidad);
  }

  return Array.from(grouped.entries()).map(([producto_id, cantidad]) => ({ producto_id, cantidad }));
};

export const ventasService = {
  async list(filters) {
    const result = await ventasRepository.findAll(filters);
    return {
      data: result.items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / filters.limit) || 1
      }
    };
  },

  async getById(id) {
    const venta = await ventasRepository.findById(id);
    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }
    return venta;
  },

  async create(items) {
    if (!items?.length) {
      throw new AppError('La venta debe incluir al menos un producto', 400);
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const normalizedItems = normalizeItems(items);
      const productIds = normalizedItems.map((item) => item.producto_id);
      const productos = await ventasRepository.lockProductosByIds(productIds, client);
      const productosById = new Map(productos.map((producto) => [Number(producto.id), producto]));

      if (productos.length !== productIds.length) {
        throw new AppError('Uno o más productos no existen', 404);
      }

      const detallesCalculados = normalizedItems.map((item) => {
        const producto = productosById.get(item.producto_id);

        if (!producto.activo) {
          throw new AppError(`El producto ${producto.codigo} no está activo`, 409);
        }

        if (producto.stock < item.cantidad) {
          throw new AppError(`Stock insuficiente para el producto ${producto.codigo}`, 409);
        }

        const subtotal = Number((item.cantidad * producto.precio_venta).toFixed(2));

        return {
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: producto.precio_venta,
          subtotal
        };
      });

      const subtotal = Number(
        detallesCalculados.reduce((acc, detalle) => acc + detalle.subtotal, 0).toFixed(2)
      );
      const total = subtotal;
      const ventaId = await ventasRepository.getNextVentaId(client);
      const venta = await ventasRepository.createVenta(
        {
          id: ventaId,
          numero_venta: formatNumeroVenta(ventaId),
          subtotal,
          total
        },
        client
      );

      const detalles = [];
      for (const detalle of detallesCalculados) {
        detalles.push(
          await ventasRepository.createDetalle(
            {
              venta_id: venta.id,
              ...detalle
            },
            client
          )
        );
        await ventasRepository.descontarStock(detalle.producto_id, detalle.cantidad, client);
      }

      await client.query('COMMIT');

      return {
        ...venta,
        detalles
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async anular(id) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const venta = await ventasRepository.lockVentaById(id, client);
      if (!venta) {
        throw new AppError('Venta no encontrada', 404);
      }

      if (venta.estado === 'ANULADA') {
        throw new AppError('La venta ya está anulada', 409);
      }

      const detalles = await ventasRepository.findDetallesByVentaId(id, client);
      for (const detalle of detalles) {
        await ventasRepository.devolverStock(detalle.producto_id, detalle.cantidad, client);
      }

      const ventaAnulada = await ventasRepository.updateEstadoVenta(id, 'ANULADA', client);

      await client.query('COMMIT');

      return {
        ...ventaAnulada,
        detalles
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
