import { productosRepository } from '../repositories/productos.repository.js';
import { AppError } from '../utils/AppError.js';

/**
 * Servicio de reglas de negocio para productos.
 */
export const productosService = {
  /**
   * Lista productos y calcula metadatos de paginacion.
   *
   * @param {object} filters Filtros y parametros de paginacion validados.
   * @returns {Promise<{data: object[], meta: object}>} Productos y metadatos.
   */
  async list(filters) {
    const result = await productosRepository.findAll(filters);
    const totalPages = Math.ceil(result.total / filters.limit) || 1;

    return {
      data: result.items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages
      }
    };
  },

  /**
   * Obtiene un producto o lanza error 404 si no existe.
   *
   * @param {number} id Identificador del producto.
   * @returns {Promise<object>} Producto encontrado.
   */
  async getById(id) {
    const producto = await productosRepository.findById(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  },

  /**
   * Crea un producto validando que el codigo no este duplicado.
   *
   * @param {object} data Datos del producto.
   * @returns {Promise<object>} Producto creado.
   */
  async create(data) {
    const existing = await productosRepository.findByCodigo(data.codigo);
    if (existing) {
      throw new AppError('Ya existe un producto con ese código', 409);
    }
    return productosRepository.create(data);
  },

  /**
   * Actualiza un producto validando existencia y codigo unico.
   *
   * @param {number} id Identificador del producto.
   * @param {object} data Datos completos del producto.
   * @returns {Promise<object>} Producto actualizado.
   */
  async update(id, data) {
    const existingCode = await productosRepository.findByCodigo(data.codigo);
    if (existingCode && Number(existingCode.id) !== id) {
      throw new AppError('Ya existe un producto con ese código', 409);
    }

    const producto = await productosRepository.update(id, data);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  },

  /**
   * Cambia el estado logico activo/inactivo de un producto.
   *
   * @param {number} id Identificador del producto.
   * @param {boolean} activo Nuevo estado del producto.
   * @returns {Promise<object>} Producto actualizado.
   */
  async updateEstado(id, activo) {
    const producto = await productosRepository.updateEstado(id, activo);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  }
};
