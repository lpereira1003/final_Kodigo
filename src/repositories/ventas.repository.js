import { query } from '../config/db.js';

const mapVenta = (row) => ({
  ...row,
  subtotal: Number(row.subtotal),
  total: Number(row.total)
});

const mapDetalle = (row) => ({
  ...row,
  cantidad: Number(row.cantidad),
  precio_unitario: Number(row.precio_unitario),
  subtotal: Number(row.subtotal)
});

const mapVentaWithDetalles = (ventaRows, detalleRows) => {
  if (!ventaRows[0]) {
    return null;
  }

  return {
    ...mapVenta(ventaRows[0]),
    detalles: detalleRows.map(mapDetalle)
  };
};

export const ventasRepository = {
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

  async getNextVentaId(client) {
    const result = await client.query("SELECT nextval(pg_get_serial_sequence('ventas', 'id'))::bigint AS id");
    return Number(result.rows[0].id);
  },

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

  async createVenta(data, client) {
    const result = await client.query(
      `INSERT INTO ventas (id, numero_venta, fecha_venta, subtotal, total, estado)
       VALUES ($1, $2, NOW(), $3, $4, 'COMPLETADA')
       RETURNING id, numero_venta, fecha_venta, subtotal, total, estado`,
      [data.id, data.numero_venta, data.subtotal, data.total]
    );

    return mapVenta(result.rows[0]);
  },

  async createDetalle(data, client) {
    const result = await client.query(
      `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, venta_id, producto_id, cantidad, precio_unitario, subtotal`,
      [data.venta_id, data.producto_id, data.cantidad, data.precio_unitario, data.subtotal]
    );

    return mapDetalle(result.rows[0]);
  },

  async descontarStock(productoId, cantidad, client) {
    await client.query(
      `UPDATE productos
       SET stock = stock - $1,
           fecha_actualizacion = NOW()
       WHERE id = $2`,
      [cantidad, productoId]
    );
  },

  async devolverStock(productoId, cantidad, client) {
    await client.query(
      `UPDATE productos
       SET stock = stock + $1,
           fecha_actualizacion = NOW()
       WHERE id = $2`,
      [cantidad, productoId]
    );
  },

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
