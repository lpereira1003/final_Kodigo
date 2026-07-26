# Roadmap - Mini Tienda Hardware API

## Objetivo general

Desarrollar y desplegar una API REST para una mini tienda de hardware utilizando Node.js, Express.js y PostgreSQL, aplicando variables de entorno, monitoreo, backups, despliegue en la nube y CI/CD.

## Estado general

- Proyecto: Mini Tienda Hardware API
- Base de datos: PostgreSQL
- Backend: Node.js + Express
- Documentación: Swagger/OpenAPI
- Estado actual: Backend funcional, publicado en GitHub y desplegado en DigitalOcean con Docker

## Fase 1 - Diseño e implementación de la base de datos

Estado: Completada

Tareas:

- Crear la base de datos mini_tienda_db.
- Crear la tabla productos.
- Crear la tabla ventas.
- Crear la tabla detalle_ventas.
- Definir claves primarias y foráneas.
- Definir restricciones de integridad.
- Crear índices.
- Insertar 20 productos iniciales de hardware con precios ficticios.
- Validar relaciones entre ventas, detalle_ventas y productos.

## Fase 2 - Desarrollo de la API REST

Estado: Completada

Tareas:

- Inicializar el proyecto Node.js.
- Configurar Express.js.
- Configurar módulos ES.
- Implementar arquitectura por capas.
- Configurar conexión con PostgreSQL mediante pg.
- Implementar variables de entorno.
- Crear CRUD de productos.
- Implementar baja lógica de productos.
- Implementar filtros y paginación.
- Implementar registro de ventas.
- Implementar detalle de ventas.
- Implementar transacciones PostgreSQL.
- Verificar existencias antes de vender.
- Descontar stock al registrar una venta.
- Implementar rollback ante errores.
- Implementar anulación de ventas.
- Devolver stock al anular una venta.
- Implementar validaciones con Zod.
- Implementar manejo centralizado de errores.
- Documentar endpoints con Swagger/OpenAPI.
- Implementar GET /health.
- Ejecutar pruebas funcionales manuales.
- Validar creación de productos.
- Validar venta correcta.
- Validar rechazo por stock insuficiente.
- Validar anulación y devolución de stock.

## Fase 3 - Control de versiones

Estado: Completada

Tareas:

- Revisar archivos antes del primer commit.
- Verificar que .env esté ignorado.
- Confirmar que .env.example no contenga secretos.
- Crear repositorio Git.
- Crear el primer commit estable.
- Publicar el repositorio en GitHub.
- Mantener commits descriptivos por fase.

Commits:

- feat: API REST con productos, ventas, transacciones y Swagger
- chore: completar fase de control de versiones

## Fase 4 - Dockerización

Estado: Completada

Tareas:

- Crear Dockerfile para la API.
- Crear .dockerignore.
- Crear docker-compose.yml si se requiere.
- Configurar variables de entorno para contenedores.
- Construir la imagen Docker.
- Ejecutar la API dentro de un contenedor.
- Validar conexión con PostgreSQL.
- Validar GET /health dentro del contenedor.
- Documentar comandos Docker.
- Evitar incluir secretos dentro de la imagen.

## Fase 5 - Despliegue en la nube

Estado: Completada

Tareas:

- Preparar el servidor Ubuntu en DigitalOcean.
- Definir estrategia de despliegue.
- Configurar variables de entorno de producción.
- Configurar PostgreSQL.
- Desplegar la API.
- Exponer el puerto correspondiente.
- Verificar acceso público.
- Verificar Swagger en producción.
- Verificar GET /health en producción.
- Configurar reinicio automático del servicio.
- Documentar la URL pública.

## Fase 6 - Monitoreo

Estado: Pendiente

Tareas:

- Validar el endpoint GET /health.
- Confirmar estado de PostgreSQL.
- Mostrar uptime.
- Mostrar timestamp.
- Mostrar entorno de ejecución.
- Mostrar versión de la API.
- Responder HTTP 200 cuando todo esté disponible.
- Responder HTTP 503 cuando PostgreSQL no responda.
- Definir estrategia de logs.
- Documentar evidencias de monitoreo.

## Fase 7 - Plan de backups

Estado: Pendiente

Tareas:

- Definir qué información será respaldada.
- Respaldar la base de datos PostgreSQL.
- Definir frecuencia de respaldos.
- Definir ubicación de almacenamiento.
- Crear procedimiento con pg_dump.
- Crear procedimiento de restauración.
- Definir política de retención.
- Documentar pruebas de restauración.
- Crear el documento del plan de backups.

## Fase 8 - CI/CD

Estado: Completada

Tareas:

- Crear workflow de GitHub Actions.
- Ejecutar validaciones o pruebas en cada push.
- Conectar GitHub Actions con DigitalOcean.
- Configurar secretos en GitHub.
- Automatizar despliegue.
- Reiniciar el servicio o contenedor.
- Ejecutar verificación de GET /health después del despliegue.
- Detener el pipeline si el health check falla.
- Documentar evidencia del pipeline exitoso.

Evidencia:

- Workflow: `.github/workflows/deploy.yml`.
- Rama de despliegue: `main`.
- Servidor destino: DigitalOcean `138.68.11.235`.
- Contenedores actualizados con `docker compose up -d --build`.
- Secret configurado en GitHub Actions: `DO_SSH_KEY_B64`.
- Run exitoso: `30225514290`.
- Commit validado: `6cf7f71`.
- Jobs exitosos: `Validate` y `Deploy to DigitalOcean`.
- Validaciones ejecutadas: `npm ci`, `npm test`, `docker compose build`, despliegue por SSH y verificacion de `/health`.
- URL verificada: `http://138.68.11.235:3001/health`.
- Resultado de produccion: API activa, base de datos `ok`, entorno `production`.

## Fase 9 - Documentación final

Estado: Pendiente

Tareas:

- Completar README.md.
- Documentar objetivo del proyecto.
- Documentar tecnologías utilizadas.
- Documentar arquitectura.
- Documentar instalación local.
- Documentar variables de entorno.
- Documentar endpoints.
- Documentar Swagger.
- Documentar Docker.
- Documentar despliegue.
- Documentar monitoreo.
- Documentar backups.
- Documentar CI/CD.
- Incluir URL pública de la API.
- Incluir enlace al repositorio.
- Incluir evidencias requeridas por la actividad.

## Fase 10 - Integración Full Stack adicional

Estado: Opcional y fuera de la rúbrica

Objetivo:

Desarrollar un frontend básico en React que consuma la API como práctica integradora personal.

Tareas previstas:

- Crear proyecto React con Vite.
- Configurar Axios.
- Crear listado de productos.
- Crear pantalla de venta.
- Agregar productos al detalle.
- Calcular totales visualmente.
- Registrar ventas mediante la API.
- Consultar historial de ventas.
- Mostrar detalle de ventas.
- Desplegar el frontend por separado.
- Documentar esta fase como aporte adicional fuera del alcance evaluado.

## Criterios de finalización

El proyecto se considerará completo cuando:

- La API funcione en producción.
- PostgreSQL esté integrado.
- Las variables de entorno estén configuradas.
- GET /health responda correctamente.
- El plan de backups esté documentado.
- El pipeline CI/CD funcione.
- El repositorio esté publicado.
- El README contenga toda la evidencia solicitada.
- La URL pública pueda ser probada por el coach.

## Registro de avances

| Fecha      | Fase            | Actividad                                                  | Estado     | Observaciones                                                                          |
| ---------- | --------------- | ---------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| 2026-07-25 | Fase 1 y Fase 2 | Base de datos y backend completados y validados localmente | Completado | API REST funcional con productos, ventas, transacciones, Swagger y health check local. |
| 2026-07-26 | Fase 3          | Control de versiones y publicación en GitHub              | Completado | .env ignorado, .env.example sin secretos, repo vinculado y commits descriptivos.       |
| 2026-07-26 | Fase 4          | Preparación de Dockerfile, compose y variables de ejemplo | Completado  | API y PostgreSQL validados en contenedores Docker.                                     |
| 2026-07-26 | Fase 5          | Despliegue inicial en DigitalOcean                        | Completado  | API publica en http://138.68.11.235:3001 con contenedores Docker.                      |
| 2026-07-26 | Fase 8          | Workflow CI/CD creado y validado                          | Completado  | Pipeline exitoso: pruebas, build Docker, despliegue SSH y verificacion de /health.    |
