# Mini Tienda Hardware API

API REST para una mini tienda de hardware, enfocada en productos, ventas y detalle de ventas.

## Estado del proyecto

Proyecto backend finalizado y desplegado en DigitalOcean con Docker y CI/CD mediante GitHub Actions.

URLs principales de producción:

```text
http://138.68.11.235:3001
http://138.68.11.235:3001/health
http://138.68.11.235:3001/api-docs/
```

Estado funcional validado:

- Ruta raíz `GET /` operativa con respuesta JSON informativa.
- Health check `GET /health` operativo y conectado a PostgreSQL.
- Swagger disponible en producción.
- Pipeline CI/CD configurado para desplegar cada `push` a `main`.
- Plan de backups documentado en `docs/BACKUP_PLAN.md`.

## Tecnologias

- Node.js
- Express.js
- PostgreSQL
- node-postgres (`pg`)
- JavaScript con modulos ES
- Zod
- Swagger/OpenAPI
- dotenv
- Helmet
- CORS
- Vitest y Supertest

## Requisitos

- Node.js 20 o superior
- PostgreSQL disponible
- Base de datos existente: `mini_tienda_db`
- Tablas existentes: `productos`, `ventas`, `detalle_ventas`

La API no crea ni modifica el esquema de PostgreSQL.

## Configuracion Local

Crear un archivo `.env` a partir de `.env.example` y completar las credenciales:

```env
NODE_ENV=development
PORT=3000
API_VERSION=1.0.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_tienda_db
DB_USER=
DB_PASSWORD=
DB_SSL=false
CORS_ORIGIN=http://localhost:5173
```

## Instalacion y Ejecucion

```bash
npm install
npm run dev
```

Para produccion:

```bash
npm start
```

## Puertos

| Entorno | URL base | Motivo |
| ------- | -------- | ------ |
| Local | `http://localhost:3000` | La API Express escucha directamente en el puerto definido por `PORT=3000`. |
| Docker/DigitalOcean | `http://138.68.11.235:3001` | El contenedor escucha internamente en `3000`, pero Docker publica `3001:3000` para evitar conflicto con otro servicio del servidor. |

## Ejecucion con Docker

Crear el archivo `.env` usando `.env.docker.example` como base y completar credenciales reales de PostgreSQL:

```bash
cp .env.docker.example .env
docker compose up -d --build
```

El servicio `api` escucha internamente en `3000` y el `docker-compose.yml` publica la API en el puerto `3001` del servidor para evitar conflicto con otros servicios. El servicio `db` ejecuta PostgreSQL en una red interna de Docker e inicializa las tablas y productos base desde `database/init.sql`.

```text
http://localhost:3001/health
http://localhost:3001/api-docs
```

Para Docker, usar `DB_HOST=db` como se muestra en `.env.docker.example`.

## CI/CD

El repositorio incluye un workflow de GitHub Actions en `.github/workflows/deploy.yml`.

El pipeline ejecuta pruebas, construye la imagen Docker, despliega en DigitalOcean por SSH y valida:

```text
http://138.68.11.235:3001/health
```

La configuracion de secretos requerida esta documentada en `docs/CI-CD.md`.

## Pruebas

```bash
npm test
npm run test:coverage
```

Las pruebas actuales mockean la capa de base de datos y no dependen de la base productiva.

## Ruta raíz

La ruta base de la API responde con información pública de entrada para evaluadores y consumidores del servicio:

```text
GET /
```

URL de producción:

```text
http://138.68.11.235:3001
```

Respuesta representativa:

```json
{
  "success": true,
  "message": "Mini Tienda Hardware API REST operativa",
  "data": {
    "project": "Mini Tienda Hardware API REST",
    "description": "API REST para la gestión de productos, ventas y detalle de ventas.",
    "version": "1.0.0",
    "environment": "production",
    "documentation": "/api-docs/",
    "health": "/health",
    "resources": {
      "productos": "/api/productos",
      "ventas": "/api/ventas"
    }
  }
}
```

## Monitoreo de la API

La API implementa un endpoint de monitoreo para verificar el estado operativo del servicio:

```text
GET /health
```

Este endpoint forma parte de las buenas prácticas DevOps del proyecto, ya que permite comprobar rápidamente si la API se encuentra disponible. También es utilizado de forma manual durante las validaciones y de forma automática por el pipeline de despliegue.

URLs de monitoreo:

| Entorno | URL |
| ------- | --- |
| Local | `http://localhost:3000/health` |
| Producción | `http://138.68.11.235:3001/health` |

El endpoint verifica la siguiente información:

- Estado de la API.
- Conectividad con PostgreSQL.
- Tiempo de actividad (`uptime`).
- Fecha y hora de la consulta.
- Entorno de ejecución.
- Versión de la API.

Respuesta exitosa representativa:

```json
{
  "success": true,
  "message": "API activa",
  "data": {
    "database": "ok",
    "uptime": 120.45,
    "timestamp": "2026-07-27T20:18:58.000Z",
    "environment": "production",
    "apiVersion": "1.0.0"
  }
}
```

Una respuesta HTTP `200` indica que la API y PostgreSQL se encuentran operativos.

Si PostgreSQL no está disponible, el endpoint devuelve HTTP `503`. Esta validación permite detectar cuando la API responde, pero no puede conectarse correctamente con la base de datos.

### Validación Manual

El endpoint `/health` fue probado desde navegador, Swagger y cliente HTTP (`curl`/Postman). Todas las pruebas respondieron correctamente, confirmando que el servicio puede verificarse tanto en desarrollo como en producción.

### Validación Automática (CI/CD)

GitHub Actions ejecuta un Health Check al finalizar el despliegue. El pipeline primero ejecuta las pruebas, construye la imagen Docker, despliega en DigitalOcean y finalmente consulta `/health`.

El despliegue solamente se considera exitoso cuando el endpoint responde correctamente.

| Verificación | Resultado |
|--------------|-----------|
| Endpoint /health implementado | ✅ |
| HTTP 200 | ✅ |
| PostgreSQL disponible | ✅ |
| Swagger | ✅ |
| Validación manual | ✅ |
| Validación mediante CI/CD | ✅ |
| Producción | ✅ |

Nota: el endpoint `/health` constituye el mecanismo de monitoreo solicitado por la actividad del Bootcamp y permite verificar rápidamente la disponibilidad del servicio tanto en desarrollo como en producción.

## Plan de Backups

El proyecto cuenta con un plan formal de backups enfocado en proteger la información crítica de PostgreSQL, especialmente las tablas de productos, ventas y detalle de ventas. La estrategia define qué información debe respaldarse, la frecuencia recomendada, el lugar de almacenamiento y el procedimiento de recuperación ante fallos.

El código fuente y la documentación se respaldan mediante GitHub. Las variables de entorno y secretos de producción deben conservarse en una ubicación segura fuera del repositorio.

Documento completo: [docs/BACKUP_PLAN.md](docs/BACKUP_PLAN.md).

## Documentacion Swagger

Con el servidor activo:

```text
http://localhost:3000/api-docs
```

Despliegue en DigitalOcean:

```text
http://138.68.11.235:3001
http://138.68.11.235:3001/health
http://138.68.11.235:3001/api-docs/
```

## Endpoints Principales

Entrada:

- `GET /`

Health:

- `GET /health`

Productos:

- `GET /api/productos`
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `PATCH /api/productos/:id/estado`

Ventas:

- `POST /api/ventas`
- `GET /api/ventas`
- `GET /api/ventas/:id`
- `PATCH /api/ventas/:id/anular`

## Estructura

```text
src/
  config/
  controllers/
  middlewares/
  repositories/
  routes/
  schemas/
  services/
  utils/
  docs/
  app.js
  server.js
tests/
```

## Decisiones Tecnicas

- Los controllers no contienen SQL; delegan en services y repositories.
- Las ventas se registran en transacciones con `BEGIN`, `COMMIT` y `ROLLBACK`.
- Los productos de una venta se bloquean con `SELECT ... FOR UPDATE`.
- El precio de venta se toma desde PostgreSQL.
- `numero_venta` se genera con la secuencia existente de `ventas.id` mediante `nextval(pg_get_serial_sequence(...))`, evitando `SELECT MAX(id)`.
- La anulacion conserva encabezado y detalle, devuelve stock y cambia el estado a `ANULADA`.
- No hay borrado fisico de productos; se usa `activo=false`.
