# CI/CD - GitHub Actions y DigitalOcean

## Objetivo

Automatizar la validación y el despliegue de la API Dockerizada en DigitalOcean cada vez que se haga push a `main`.

## Workflow

Archivo:

```text
.github/workflows/deploy.yml
```

Flujo:

- Ejecuta `npm ci`.
- Ejecuta `npm test`.
- Construye la imagen con `docker compose build`.
- Se conecta por SSH al servidor.
- Actualiza `/opt/mini-tienda-api` con `origin/main`.
- Ejecuta `docker compose up -d --build`.
- Limpia imágenes Docker sin uso.
- Verifica `GET /health` público.
- Falla el pipeline si las pruebas, el build, el despliegue o el health check fallan.

## Secrets requeridos

Configurar en GitHub:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Secrets:

| Nombre | Valor |
| ------ | ----- |
| `DO_HOST` | `138.68.11.235` |
| `DO_USER` | `root` |
| `DO_SSH_KEY` | Llave privada SSH autorizada en el servidor para despliegue |
| `APP_HEALTH_URL` | `http://138.68.11.235:3001/health` |

## Servidor

Directorio de despliegue:

```text
/opt/mini-tienda-api
```

Servicios Docker:

```bash
docker compose ps
```

URL pública:

```text
http://138.68.11.235:3001/health
```
