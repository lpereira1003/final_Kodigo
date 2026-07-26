import { productosService } from '../services/productos.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Controladores HTTP para las operaciones de productos.
 */
export const productosController = {
  /**
   * Lista productos aplicando filtros y paginacion validados.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async list(req, res) {
    const { data, meta } = await productosService.list(req.validated.query);
    return successResponse(res, 200, 'Productos obtenidos correctamente', data, meta);
  },

  /**
   * Obtiene un producto por identificador.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async getById(req, res) {
    const producto = await productosService.getById(req.validated.params.id);
    return successResponse(res, 200, 'Producto obtenido correctamente', producto);
  },

  /**
   * Crea un producto nuevo.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async create(req, res) {
    const producto = await productosService.create(req.validated.body);
    return successResponse(res, 201, 'Producto creado correctamente', producto);
  },

  /**
   * Actualiza todos los datos editables de un producto.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async update(req, res) {
    const producto = await productosService.update(req.validated.params.id, req.validated.body);
    return successResponse(res, 200, 'Producto actualizado correctamente', producto);
  },

  /**
   * Actualiza el estado logico activo/inactivo de un producto.
   *
   * @param {import('express').Request} req Solicitud Express.
   * @param {import('express').Response} res Respuesta Express.
   * @returns {Promise<import('express').Response>} Respuesta HTTP.
   */
  async updateEstado(req, res) {
    const producto = await productosService.updateEstado(
      req.validated.params.id,
      req.validated.body.activo
    );
    return successResponse(res, 200, 'Estado del producto actualizado correctamente', producto);
  }
};
