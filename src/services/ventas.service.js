import { getClient } from '../config/db.js';
import { ventasRepository } from '../repositories/ventas.repository.js';
import { AppError } from '../utils/AppError.js';

/**
 * Genera el numero publico de venta usando el id reservado en PostgreSQL.
 *
 * @param {number} id Identificador reservado desde la secuencia de ventas.
 * @param {Date} [date=new Date()] Fecha usada para el prefijo anual.
 * @returns {string} Numero de venta con formato VTA-YYYY-000001.
 */
const formatNumeroVenta = (id, date = new Date()) => {
  const year = date.getFullYear();
  return `VTA-${year}-${String(id).padStart(6, '0')}`;
};

/**
 * Agrupa items repetidos para respetar la restriccion UNIQUE de detalle_ventas.
 *
 * @param {{producto_id: number, cantidad: number}[]} items Items solicitados.
 * @returns {{producto_id: number, cantidad: number}[]} Items consolidados.
 */
const normalizeItems = (items) => {
  const grouped = new Map();

  for (const item of items) {
    grouped.set(item.producto_id, (grouped.get(item.producto_id) || 0) + item.cantidad);
  }

  return Array.from(grouped.entries()).map(([producto_id, cantidad]) => ({ producto_id, cantidad }));
};

/**
 * Servicio de reglas de negocio para ventas y movimientos de inventario.
 */
export const ventasService = {
  /**
   * Lista ventas y calcula metadatos de paginacion.
   *
   * @param {object} filters Filtros y parametros de paginacion validados.
   * @returns {Promise<{data: object[], meta: object}>} Ventas y metadatos.
   */
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

  /**
   * Obtiene una venta con detalle o lanza error 404 si no existe.
   *
   * @param {number} id Identificador de la venta.
   * @returns {Promise<object>} Venta con detalles.
   */
  async getById(id) {
    const venta = await ventasRepository.findById(id);
    if (!venta) {
      throw new AppError('Venta no encontrada', 404);
    }
    return venta;
  },

  /**
   * Registra una venta transaccional, calcula totales y descuenta stock.
   *
   * @param {{producto_id: number, cantidad: number}[]} items Productos vendidos.
   * @returns {Promise<object>} Venta creada con detalle.
   */
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

  /**
   * Anula una venta transaccional y devuelve cantidades al inventario.
   *
   * @param {number} id Identificador de la venta.
   * @returns {Promise<object>} Venta anulada con detalle historico.
   */
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
