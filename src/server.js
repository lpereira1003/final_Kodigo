import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool } from './config/db.js';

const app = createApp();

/**
 * Servidor HTTP principal de la API.
 */
const server = app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
  console.log(`Swagger disponible en http://localhost:${env.port}/api-docs`);
});

/**
 * Cierra el servidor HTTP y el pool PostgreSQL ante señales del sistema.
 *
 * @param {string} signal Señal recibida por el proceso.
 * @returns {Promise<void>}
 */
const shutdown = async (signal) => {
  console.log(`${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
