# Mini Tienda Hardware API

API REST para una mini tienda de hardware, enfocada en productos, ventas y detalle de ventas.

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

## Pruebas

```bash
npm test
npm run test:coverage
```

Las pruebas actuales mockean la capa de base de datos y no dependen de la base productiva.

## Documentacion Swagger

Con el servidor activo:

```text
http://localhost:3000/api-docs
```

## Endpoints Principales

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
