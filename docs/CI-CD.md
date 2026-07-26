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
- Falla con un mensaje explicito si falta la llave SSH de despliegue.

## Secrets requeridos

Configurar en GitHub:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Secret requerido en el environment `FINALKODIGO`:

| Nombre | Valor |
| ------ | ----- |
| `DO_SSH_KEY` | Llave privada SSH autorizada en el servidor para despliegue |

El workflow tambien acepta un secret llamado `FINALKODIGO` como respaldo, por si la llave fue guardada con el nombre del environment. El host `138.68.11.235`, el usuario `root` y la URL `http://138.68.11.235:3001/health` no son secretos y estan definidos directamente en el workflow.

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
