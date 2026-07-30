# Roadmap - Mini Tienda Hardware API

## Objetivo general

Desarrollar y desplegar una API REST para una mini tienda de hardware utilizando Node.js, Express.js y PostgreSQL, aplicando variables de entorno, monitoreo, backups, despliegue en la nube y CI/CD.

## Estado general

- Proyecto: Mini Tienda Hardware API
- Base de datos: PostgreSQL
- Backend: Node.js + Express
- Documentación: Swagger/OpenAPI
- Estado actual: Proyecto backend finalizado, publicado en GitHub y desplegado en DigitalOcean con Docker y CI/CD

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

Estado: Completada

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

Evidencia:

- Endpoint implementado: `GET /health`.
- URL local documentada: `http://localhost:3000/health`.
- URL de produccion documentada: `http://138.68.11.235:3001/health`.
- Validacion de API operativa mediante respuesta HTTP `200`.
- Validacion de conectividad con PostgreSQL mediante consulta interna `SELECT 1`.
- Respuesta de monitoreo con estado de base de datos, uptime, timestamp, entorno y version de la API.
- Respuesta HTTP `503` cuando PostgreSQL no se encuentra disponible.
- Endpoint documentado en Swagger/OpenAPI.
- Evidencia principal agregada en `README.md`, seccion `Monitoreo de la API`.
- Validacion automatica mediante GitHub Actions al finalizar el despliegue en DigitalOcean.

## Fase 7 - Plan de backups

Estado: Completada

Tareas:

- [x] Definir qué información será respaldada.
- [x] Documentar respaldo de la base de datos PostgreSQL.
- [x] Definir frecuencia de respaldos.
- [x] Definir ubicación de almacenamiento.
- [x] Crear procedimiento con `pg_dump`.
- [x] Crear procedimiento de restauración con `pg_restore`.
- [x] Definir política de retención.
- [ ] Documentar pruebas de restauración ejecutadas. Pendiente: no se han realizado pruebas reales de restauración.
- [x] Crear el documento del plan de backups.

Evidencia:

- Documento creado: `docs/BACKUP_PLAN.md`.
- Elemento crítico identificado: base de datos PostgreSQL `mini_tienda_db`.
- Tablas cubiertas: `productos`, `ventas` y `detalle_ventas`.
- Código fuente respaldado mediante GitHub.
- Variables de entorno excluidas del repositorio y tratadas como información sensible.
- Frecuencia recomendada definida para base de datos, código, variables, documentación y despliegues importantes.
- Lugar de almacenamiento recomendado fuera del contenedor y fuera del repositorio.
- Procedimiento de respaldo documentado con `pg_dump -Fc`.
- Procedimiento de recuperación documentado con `pg_restore`.
- Nota explícita: no se ejecutaron respaldos reales ni pruebas reales de restauración en esta fase documental.

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
- Mapeo de puertos en Docker/DigitalOcean: `3001:3000` (`3001` publico hacia `3000` interno del contenedor).
- Secret configurado en GitHub Actions: `DO_SSH_KEY_B64`.
- Run exitoso: `30225514290`.
- Commit validado: `6cf7f71`.
- Jobs exitosos: `Validate` y `Deploy to DigitalOcean`.
- Validaciones ejecutadas: `npm ci`, `npm test`, `docker compose build`, despliegue por SSH y verificacion de `/health`.
- URL verificada: `http://138.68.11.235:3001/health`.
- Resultado de produccion: API activa, base de datos `ok`, entorno `production`.

## Fase 9 - Documentación final

Estado: Completada

Tareas:

- [x] Completar README.md.
- [x] Documentar objetivo del proyecto.
- [x] Documentar tecnologías utilizadas.
- [x] Documentar arquitectura.
- [x] Documentar instalación local.
- [x] Documentar variables de entorno.
- [x] Documentar endpoints.
- [x] Documentar Swagger.
- [x] Documentar Docker.
- [x] Documentar despliegue.
- [x] Documentar monitoreo.
- [x] Documentar backups.
- [x] Documentar CI/CD.
- [x] Incluir URL pública de la API.
- [x] Incluir evidencia de ruta raiz `GET /`.
- [x] Incluir evidencias requeridas por la actividad.

Evidencia:

- README actualizado con estado del proyecto, URLs de produccion y endpoints principales.
- Ruta raiz `GET /` documentada y validada en produccion.
- URL publica principal documentada: `http://138.68.11.235:3001`.
- Swagger documentado: `http://138.68.11.235:3001/api-docs/`.
- Health check documentado: `http://138.68.11.235:3001/health`.
- Monitoreo documentado en README.
- Plan de backups documentado en `docs/BACKUP_PLAN.md`.
- CI/CD documentado en README y `docs/CI-CD.md`.

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
- GET / responda con informacion de entrada de la API.
- El plan de backups esté documentado.
- El pipeline CI/CD funcione.
- El repositorio esté publicado.
- El README contenga toda la evidencia solicitada.
- La URL pública pueda ser probada por el coach.

Estado final:

- Criterios de finalizacion cumplidos para el alcance backend y DevOps del proyecto.
- La integracion Full Stack queda documentada como fase opcional fuera de la rubrica.

## Registro de avances

| Fecha      | Fase            | Actividad                                                  | Estado     | Observaciones                                                                          |
| ---------- | --------------- | ---------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| 2026-07-25 | Fase 1 y Fase 2 | Base de datos y backend completados y validados localmente | Completado | API REST funcional con productos, ventas, transacciones, Swagger y health check local. |
| 2026-07-26 | Fase 3          | Control de versiones y publicación en GitHub              | Completado | .env ignorado, .env.example sin secretos, repo vinculado y commits descriptivos.       |
| 2026-07-26 | Fase 4          | Preparación de Dockerfile, compose y variables de ejemplo | Completado  | API y PostgreSQL validados en contenedores Docker.                                     |
| 2026-07-26 | Fase 5          | Despliegue inicial en DigitalOcean                        | Completado  | API publica en http://138.68.11.235:3001 con contenedores Docker.                      |
| 2026-07-26 | Fase 8          | Workflow CI/CD creado y validado                          | Completado  | Pipeline exitoso: pruebas, build Docker, despliegue SSH y verificacion de /health.    |
| 2026-07-27 | Fase 6          | Monitoreo documentado y validado                          | Completado  | Endpoint GET /health documentado con validacion manual, Swagger y CI/CD.              |
| 2026-07-27 | Fase 7          | Plan de backups documentado                               | Completado  | Plan creado en docs/BACKUP_PLAN.md; no se ejecutaron respaldos ni restauraciones reales. |
| 2026-07-30 | Ruta raiz       | Respuesta informativa para GET / desplegada               | Completado  | Produccion responde HTTP 200 en http://138.68.11.235:3001 con metadata publica de la API. |
| 2026-07-30 | Fase 9          | Documentacion final actualizada                           | Completado  | README y roadmap actualizados acorde al estado final del backend y DevOps.             |
