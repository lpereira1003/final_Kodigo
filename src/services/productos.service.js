import { productosRepository } from '../repositories/productos.repository.js';
import { AppError } from '../utils/AppError.js';

export const productosService = {
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

  async getById(id) {
    const producto = await productosRepository.findById(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  },

  async create(data) {
    const existing = await productosRepository.findByCodigo(data.codigo);
    if (existing) {
      throw new AppError('Ya existe un producto con ese código', 409);
    }
    return productosRepository.create(data);
  },

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

  async updateEstado(id, activo) {
    const producto = await productosRepository.updateEstado(id, activo);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  }
};
