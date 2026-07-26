import { query } from '../config/db.js';

/**
 * Normaliza tipos numericos devueltos por PostgreSQL para ventas.
 *
 * @param {object} row Fila cruda de PostgreSQL.
 * @returns {object} Venta serializable para la API.
 */
const mapVenta = (row) => ({
  ...row,
  subtotal: Number(row.subtotal),
  total: Number(row.total)
});

/**
 * Normaliza tipos numericos devueltos por PostgreSQL para detalles de venta.
 *
 * @param {object} row Fila cruda de PostgreSQL.
 * @returns {object} Detalle de venta serializable para la API.
 */
const mapDetalle = (row) => ({
  ...row,
  cantidad: Number(row.cantidad),
  precio_unitario: Number(row.precio_unitario),
  subtotal: Number(row.subtotal)
});

/**
 * Combina encabezado y detalle en una venta completa.
 *
 * @param {object[]} ventaRows Filas de encabezado.
 * @param {object[]} detalleRows Filas de detalle.
 * @returns {object | null} Venta con detalles o nulo.
 */
const mapVentaWithDetalles = (ventaRows, detalleRows) => {
  if (!ventaRows[0]) {
    return null;
  }

  return {
    ...mapVenta(ventaRows[0]),
    detalles: detalleRows.map(mapDetalle)
  };
};

/**
 * Repositorio SQL para ventas y detalle_ventas.
 */
export const ventasRepository = {
  /**
   * Busca ventas con filtros opcionales y conteo total.
   *
   * @param {object} filters Filtros y paginacion.
   * @returns {Promise<{items: object[], total: number}>} Ventas y total.
   */
  async findAll(filters) {
    const params = [];
    const where = [];

    if (filters.estado) {
      params.push(filters.estado);
      where.push(`estado = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;
    params.push(filters.limit, offset);

    const [itemsResult, countResult] = await Promise.all([
      query(
        `SELECT id, numero_venta, fecha_venta, subtotal, total, estado
         FROM ventas
         ${whereSql}
         ORDER BY fecha_venta DESC, id DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      query(`SELECT COUNT(*)::int AS total FROM ventas ${whereSql}`, params.slice(0, params.length - 2))
    ]);

    return {
      items: itemsResult.rows.map(mapVenta),
      total: countResult.rows[0].total
    };
  },

  /**
   * Busca una venta con sus detalles.
   *
   * @param {number} id Identificador de la venta.
   * @param {{query: Function}} [db] Pool o cliente PostgreSQL.
   * @returns {Promise<object | null>} Venta con detalles o nulo.
   */
  async findById(id, db = { query }) {
    const ventaResult = await db.query(
      `SELECT id, numero_venta, fecha_venta, subtotal, total, estado
       FROM ventas
       WHERE id = $1`,
      [id]
    );

    const detalleResult = await db.query(
      `SELECT dv.id, dv.venta_id, dv.producto_id, p.codigo, p.nombre,
              dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_ventas dv
       INNER JOIN productos p ON p.id = dv.producto_id
       WHERE dv.venta_id = $1
       ORDER BY dv.id ASC`,
      [id]
    );

    return mapVentaWithDetalles(ventaResult.rows, detalleResult.rows);
  },

  /**
   * Reserva el siguiente id de la secuencia de ventas.
   *
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<number>} Id reservado.
   */
  async getNextVentaId(client) {
    const result = await client.query("SELECT nextval(pg_get_serial_sequence('ventas', 'id'))::bigint AS id");
    return Number(result.rows[0].id);
  },

  /**
   * Bloquea productos involucrados en una venta para validar stock.
   *
   * @param {number[]} productIds Identificadores de productos.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<object[]>} Productos bloqueados.
   */
  async lockProductosByIds(productIds, client) {
    const result = await client.query(
      `SELECT id, codigo, nombre, precio_venta, stock, activo
       FROM productos
       WHERE id = ANY($1::bigint[])
       FOR UPDATE`,
      [productIds]
    );

    return result.rows.map((row) => ({
      ...row,
      precio_venta: Number(row.precio_venta),
      stock: Number(row.stock)
    }));
  },

  /**
   * Inserta el encabezado de una venta.
   *
   * @param {object} data Datos calculados de la venta.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<object>} Venta creada.
   */
  async createVenta(data, client) {
    const result = await client.query(
      `INSERT INTO ventas (id, numero_venta, fecha_venta, subtotal, total, estado)
       VALUES ($1, $2, NOW(), $3, $4, 'COMPLETADA')
       RETURNING id, numero_venta, fecha_venta, subtotal, total, estado`,
      [data.id, data.numero_venta, data.subtotal, data.total]
    );

    return mapVenta(result.rows[0]);
  },

  /**
   * Inserta un detalle de venta.
   *
   * @param {object} data Datos calculados del detalle.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<object>} Detalle creado.
   */
  async createDetalle(data, client) {
    const result = await client.query(
      `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, venta_id, producto_id, cantidad, precio_unitario, subtotal`,
      [data.venta_id, data.producto_id, data.cantidad, data.precio_unitario, data.subtotal]
    );

    return mapDetalle(result.rows[0]);
  },

  /**
   * Descuenta unidades del inventario de un producto.
   *
   * @param {number} productoId Identificador del producto.
   * @param {number} cantidad Cantidad a descontar.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<void>}
   */
  async descontarStock(productoId, cantidad, client) {
    await client.query(
      `UPDATE productos
       SET stock = stock - $1,
           fecha_actualizacion = NOW()
       WHERE id = $2`,
      [cantidad, productoId]
    );
  },

  /**
   * Devuelve unidades al inventario de un producto.
   *
   * @param {number} productoId Identificador del producto.
   * @param {number} cantidad Cantidad a devolver.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<void>}
   */
  async devolverStock(productoId, cantidad, client) {
    await client.query(
      `UPDATE productos
       SET stock = stock + $1,
           fecha_actualizacion = NOW()
       WHERE id = $2`,
      [cantidad, productoId]
    );
  },

  /**
   * Bloquea una venta para procesar su anulacion de forma segura.
   *
   * @param {number} id Identificador de la venta.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<object | null>} Venta bloqueada o nulo.
   */
  async lockVentaById(id, client) {
    const result = await client.query(
      `SELECT id, numero_venta, fecha_venta, subtotal, total, estado
       FROM ventas
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    return result.rows[0] ? mapVenta(result.rows[0]) : null;
  },

  /**
   * Obtiene los detalles historicos de una venta.
   *
   * @param {number} ventaId Identificador de la venta.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<object[]>} Detalles de la venta.
   */
  async findDetallesByVentaId(ventaId, client) {
    const result = await client.query(
      `SELECT id, venta_id, producto_id, cantidad, precio_unitario, subtotal
       FROM detalle_ventas
       WHERE venta_id = $1
       ORDER BY id ASC`,
      [ventaId]
    );

    return result.rows.map(mapDetalle);
  },

  /**
   * Actualiza el estado de una venta.
   *
   * @param {number} id Identificador de la venta.
   * @param {'COMPLETADA' | 'ANULADA'} estado Nuevo estado.
   * @param {import('pg').PoolClient} client Cliente transaccional.
   * @returns {Promise<object | null>} Venta actualizada o nulo.
   */
  async updateEstadoVenta(id, estado, client) {
    const result = await client.query(
      `UPDATE ventas
       SET estado = $1
       WHERE id = $2
       RETURNING id, numero_venta, fecha_venta, subtotal, total, estado`,
      [estado, id]
    );

    return result.rows[0] ? mapVenta(result.rows[0]) : null;
  }
};
