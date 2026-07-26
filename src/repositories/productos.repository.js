import { query } from '../config/db.js';

/**
 * Normaliza tipos numericos devueltos por PostgreSQL para productos.
 *
 * @param {object} row Fila cruda de PostgreSQL.
 * @returns {object} Producto serializable para la API.
 */
const mapProducto = (row) => ({
  ...row,
  precio_compra: Number(row.precio_compra),
  precio_venta: Number(row.precio_venta),
  stock: Number(row.stock)
});

/**
 * Repositorio SQL para la tabla productos.
 */
export const productosRepository = {
  /**
   * Busca productos con filtros opcionales y conteo total.
   *
   * @param {object} filters Filtros y paginacion.
   * @returns {Promise<{items: object[], total: number}>} Productos y total.
   */
  async findAll(filters) {
    const where = [];
    const params = [];

    if (filters.nombre) {
      params.push(`%${filters.nombre}%`);
      where.push(`nombre ILIKE $${params.length}`);
    }

    if (filters.codigo) {
      params.push(`%${filters.codigo}%`);
      where.push(`codigo ILIKE $${params.length}`);
    }

    if (typeof filters.activo === 'boolean') {
      params.push(filters.activo);
      where.push(`activo = $${params.length}`);
    }

    if (Number.isInteger(filters.stock)) {
      params.push(filters.stock);
      where.push(`stock = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;

    params.push(filters.limit, offset);

    const [itemsResult, countResult] = await Promise.all([
      query(
        `SELECT id, codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo,
                fecha_creacion, fecha_actualizacion
         FROM productos
         ${whereSql}
         ORDER BY id DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      ),
      query(`SELECT COUNT(*)::int AS total FROM productos ${whereSql}`, params.slice(0, params.length - 2))
    ]);

    return {
      items: itemsResult.rows.map(mapProducto),
      total: countResult.rows[0].total
    };
  },

  /**
   * Busca un producto por identificador.
   *
   * @param {number} id Identificador del producto.
   * @returns {Promise<object | null>} Producto encontrado o nulo.
   */
  async findById(id) {
    const result = await query(
      `SELECT id, codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo,
              fecha_creacion, fecha_actualizacion
       FROM productos
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ? mapProducto(result.rows[0]) : null;
  },

  /**
   * Busca un producto por codigo unico.
   *
   * @param {string} codigo Codigo del producto.
   * @returns {Promise<object | null>} Registro minimo o nulo.
   */
  async findByCodigo(codigo) {
    const result = await query('SELECT id FROM productos WHERE codigo = $1', [codigo]);
    return result.rows[0] || null;
  },

  /**
   * Inserta un producto en PostgreSQL.
   *
   * @param {object} data Datos del producto.
   * @returns {Promise<object>} Producto creado.
   */
  async create(data) {
    const result = await query(
      `INSERT INTO productos
        (codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo,
                 fecha_creacion, fecha_actualizacion`,
      [
        data.codigo,
        data.nombre,
        data.descripcion ?? null,
        data.precio_compra,
        data.precio_venta,
        data.stock,
        data.activo
      ]
    );

    return mapProducto(result.rows[0]);
  },

  /**
   * Actualiza todos los campos editables de un producto.
   *
   * @param {number} id Identificador del producto.
   * @param {object} data Datos completos del producto.
   * @returns {Promise<object | null>} Producto actualizado o nulo.
   */
  async update(id, data) {
    const result = await query(
      `UPDATE productos
       SET codigo = $1,
           nombre = $2,
           descripcion = $3,
           precio_compra = $4,
           precio_venta = $5,
           stock = $6,
           activo = $7,
           fecha_actualizacion = NOW()
       WHERE id = $8
       RETURNING id, codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo,
                 fecha_creacion, fecha_actualizacion`,
      [
        data.codigo,
        data.nombre,
        data.descripcion ?? null,
        data.precio_compra,
        data.precio_venta,
        data.stock,
        data.activo,
        id
      ]
    );

    return result.rows[0] ? mapProducto(result.rows[0]) : null;
  },

  /**
   * Actualiza el estado logico de un producto.
   *
   * @param {number} id Identificador del producto.
   * @param {boolean} activo Nuevo estado.
   * @returns {Promise<object | null>} Producto actualizado o nulo.
   */
  async updateEstado(id, activo) {
    const result = await query(
      `UPDATE productos
       SET activo = $1,
           fecha_actualizacion = NOW()
       WHERE id = $2
       RETURNING id, codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo,
                 fecha_creacion, fecha_actualizacion`,
      [activo, id]
    );

    return result.rows[0] ? mapProducto(result.rows[0]) : null;
  }
};
