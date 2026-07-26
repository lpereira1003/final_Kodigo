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
- Se conecta por SSH al servidor usando OpenSSH.
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

Secret recomendado en el environment `FINALKODIGO`:

| Nombre | Valor |
| ------ | ----- |
| `DO_SSH_KEY_B64` | Llave privada SSH autorizada en el servidor, codificada en base64 en una sola linea |

El workflow tambien acepta `DO_SSH_KEY` o `FINALKODIGO` como respaldo, pero `DO_SSH_KEY_B64` evita errores de formato por saltos de linea al pegar la llave privada en GitHub Secrets. El host `138.68.11.235`, el usuario `root` y la URL `http://138.68.11.235:3001/health` no son secretos y estan definidos directamente en el workflow.

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
