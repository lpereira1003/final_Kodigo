import { ventasService } from '../services/ventas.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Controladores HTTP para registro, consulta y anulacion de ventas.
 */
export const ventasController = {
  /**
   * Registra una venta con sus detalles.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async create(req, res) {
    const venta = await ventasService.create(req.validated.body.items);
    return successResponse(res, 201, 'Venta registrada correctamente', venta);
  },

  /**
   * Lista ventas aplicando filtros y paginacion validados.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async list(req, res) {
    const { data, meta } = await ventasService.list(req.validated.query);
    return successResponse(res, 200, 'Ventas obtenidas correctamente', data, meta);
  },

  /**
   * Obtiene una venta con su detalle.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async getById(req, res) {
    const venta = await ventasService.getById(req.validated.params.id);
    return successResponse(res, 200, 'Venta obtenida correctamente', venta);
  },

  /**
   * Anula una venta y devuelve el stock al inventario.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async anular(req, res) {
    const venta = await ventasService.anular(req.validated.params.id);
    return successResponse(res, 200, 'Venta anulada correctamente', venta);
  }
};
