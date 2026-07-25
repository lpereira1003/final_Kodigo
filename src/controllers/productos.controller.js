import { productosService } from '../services/productos.service.js';
import { successResponse } from '../utils/responses.js';

export const productosController = {
  async list(req, res) {
    const { data, meta } = await productosService.list(req.validated.query);
    return successResponse(res, 200, 'Productos obtenidos correctamente', data, meta);
  },

  async getById(req, res) {
    const producto = await productosService.getById(req.validated.params.id);
    return successResponse(res, 200, 'Producto obtenido correctamente', producto);
  },

  async create(req, res) {
    const producto = await productosService.create(req.validated.body);
    return successResponse(res, 201, 'Producto creado correctamente', producto);
  },

  async update(req, res) {
    const producto = await productosService.update(req.validated.params.id, req.validated.body);
    return successResponse(res, 200, 'Producto actualizado correctamente', producto);
  },

  async updateEstado(req, res) {
    const producto = await productosService.updateEstado(
      req.validated.params.id,
      req.validated.body.activo
    );
    return successResponse(res, 200, 'Estado del producto actualizado correctamente', producto);
  }
};
