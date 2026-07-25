import { ventasService } from '../services/ventas.service.js';
import { successResponse } from '../utils/responses.js';

export const ventasController = {
  async create(req, res) {
    const venta = await ventasService.create(req.validated.body.items);
    return successResponse(res, 201, 'Venta registrada correctamente', venta);
  },

  async list(req, res) {
    const { data, meta } = await ventasService.list(req.validated.query);
    return successResponse(res, 200, 'Ventas obtenidas correctamente', data, meta);
  },

  async getById(req, res) {
    const venta = await ventasService.getById(req.validated.params.id);
    return successResponse(res, 200, 'Venta obtenida correctamente', venta);
  },

  async anular(req, res) {
    const venta = await ventasService.anular(req.validated.params.id);
    return successResponse(res, 200, 'Venta anulada correctamente', venta);
  }
};
