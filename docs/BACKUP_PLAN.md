# Plan de Backups - Mini Tienda Hardware API

## 1. Objetivo

El propósito de este plan es garantizar la recuperación de la información del proyecto ante:

- Fallos del servidor.
- Errores humanos.
- Corrupción de datos.
- Pérdida de contenedores.
- Problemas durante un despliegue.
- Pérdida parcial o total del entorno de producción.

El elemento crítico del proyecto es la base de datos PostgreSQL, porque contiene la información operativa de productos, ventas y detalle de ventas.

Este plan forma parte de la documentación final del proyecto backend y DevOps de Mini Tienda Hardware API, publicado en producción en `http://138.68.11.235:3001`.

## 2. Alcance

### Base de datos PostgreSQL

El respaldo principal debe cubrir la base de datos `mini_tienda_db`, incluyendo:

- Tabla `productos`.
- Tabla `ventas`.
- Tabla `detalle_ventas`.
- Secuencias.
- Restricciones.
- Relaciones.
- Datos existentes.

### Código fuente

El código fuente se conserva en GitHub mediante control de versiones. Cada `push` al repositorio funciona como respaldo del estado del código y permite recuperar versiones anteriores mediante Git.

### Configuración

La configuración sensible debe tratarse de forma separada:

- `.env` no se almacena en GitHub.
- Debe conservarse una copia segura de `.env` fuera del repositorio.
- `.env.example` solamente contiene nombres de variables y no secretos.
- Las claves SSH y secretos de GitHub Actions no deben incluirse en los respaldos comunes del proyecto.

### Documentación

La documentación del proyecto se respalda mediante GitHub, incluyendo:

- `README.md`.
- `ROADMAP.md`.
- `docs/BACKUP_PLAN.md`.
- Documentación CI/CD.
- Documentación Swagger/OpenAPI.

## 3. Clasificación de la información

| Información | Importancia | Método de respaldo |
|-------------|-------------|--------------------|
| PostgreSQL | Crítica | `pg_dump` |
| Código fuente | Alta | GitHub |
| Variables de producción | Crítica | Copia segura fuera del repositorio |
| Documentación | Alta | GitHub |
| Imágenes Docker | Recuperable | Reconstrucción desde Dockerfile |

Las imágenes Docker no requieren respaldo permanente porque pueden reconstruirse desde el repositorio usando el `Dockerfile` y `docker-compose.yml`.

## 4. Frecuencia

| Tipo de respaldo | Frecuencia |
|------------------|------------|
| Base de datos | Diario |
| Código fuente | En cada `push` |
| Variables de entorno | Después de cada modificación |
| Documentación | En cada commit relevante |
| Respaldo previo a despliegue importante | Antes de cambios críticos |

Esta frecuencia es una política recomendada para producción. Actualmente este documento define el plan y el procedimiento; no se afirma que exista una tarea `cron` u otra automatización implementada.

## 5. Formato del respaldo

Para PostgreSQL se recomienda utilizar `pg_dump` con formato personalizado (`-Fc`), porque permite restauraciones más flexibles con `pg_restore`.

Formato sugerido del archivo:

```bash
pg_dump -Fc -d mini_tienda_db -f mini_tienda_YYYYMMDD_HHMM.backup
```

Ejemplo de nombre de archivo:

```text
mini_tienda_20260727_2100.backup
```

## 6. Lugar de almacenamiento

Los respaldos de la base de datos deben almacenarse fuera del contenedor de PostgreSQL para evitar pérdida de información si el contenedor se elimina o se reemplaza.

Ubicaciones recomendadas:

- Directorio seguro del servidor, por ejemplo `/opt/backups/mini-tienda/`.
- Copia externa fuera del servidor principal.
- Almacenamiento privado en la nube o repositorio seguro de respaldos.

No deben almacenarse respaldos con datos productivos dentro del repositorio GitHub del proyecto.

## 7. Procedimiento de respaldo

Procedimiento recomendado para generar un respaldo manual:

1. Conectarse al servidor donde se encuentra PostgreSQL.
2. Confirmar que la base de datos `mini_tienda_db` esté disponible.
3. Crear o validar el directorio seguro de respaldos.
4. Ejecutar `pg_dump` con formato personalizado.
5. Verificar que el archivo `.backup` fue creado.
6. Copiar el respaldo a una ubicación externa segura.
7. Registrar la fecha, hora y responsable del respaldo.

Comando base:

```bash
pg_dump -Fc -d mini_tienda_db -f mini_tienda_YYYYMMDD_HHMM.backup
```

Si PostgreSQL se ejecuta dentro de Docker, el respaldo debe ejecutarse desde un contexto con acceso a la base de datos y sus credenciales, sin escribir secretos dentro del repositorio.

## 8. Procedimiento de recuperación ante fallos

Procedimiento recomendado para restaurar la base de datos ante un fallo:

1. Identificar el respaldo válido más reciente.
2. Detener temporalmente operaciones que escriban en la base de datos.
3. Crear una base de datos nueva o limpiar la base afectada, según el tipo de incidente.
4. Restaurar el archivo `.backup` usando `pg_restore`.
5. Validar tablas, relaciones y datos principales.
6. Levantar nuevamente la API.
7. Verificar el endpoint `GET /health`.
8. Verificar la ruta raíz `GET /`.
9. Probar consultas básicas de productos y ventas.
10. Documentar el incidente y la recuperación realizada.

Comando base de restauración:

```bash
pg_restore -d mini_tienda_db mini_tienda_YYYYMMDD_HHMM.backup
```

Si se necesita recrear objetos existentes, se puede evaluar el uso de opciones de `pg_restore` como `--clean` en un entorno controlado.

## 9. Política de retención

Política recomendada:

| Tipo | Retención sugerida |
|------|--------------------|
| Respaldos diarios | 7 días |
| Respaldos semanales | 4 semanas |
| Respaldos mensuales | 3 meses |
| Respaldo previo a cambio crítico | Hasta validar estabilidad posterior al despliegue |

La retención puede ajustarse según almacenamiento disponible, criticidad de los datos y requerimientos del bootcamp o del entorno productivo.

## 10. Validación del plan

Este documento define el plan formal de respaldos y recuperación. No se ejecutaron respaldos reales ni pruebas reales de restauración como parte de esta actualización documental.

Validaciones recomendadas para una siguiente fase:

- Ejecutar un respaldo manual con `pg_dump`.
- Restaurar el respaldo en una base de datos de prueba.
- Confirmar que las tablas `productos`, `ventas` y `detalle_ventas` se recuperan correctamente.
- Validar la API contra la base restaurada.
- Confirmar que `GET /` y `GET /health` responden correctamente.
- Registrar evidencia del procedimiento.

## 11. Observaciones

El plan de backups cubre el requisito de la actividad del Bootcamp al definir qué información será respaldada, la frecuencia recomendada, el lugar de almacenamiento y el procedimiento de recuperación ante fallos.

Los secretos, claves SSH y variables sensibles deben manejarse fuera del repositorio y no deben incluirse en respaldos compartidos del proyecto.
