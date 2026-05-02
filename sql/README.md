# SQL — Ganga Bot (TelegramOfertas)

Scripts y migraciones para **PostgreSQL** alineados con las entidades TypeORM del API (`category`, `deal`, `deal_event`) y nombres de columna en **snake_case** en base de datos.

## Estructura

| Ruta | Uso |
|------|-----|
| `install_all.sql` | Instalación completa en local: extensión opcional `unaccent` + función `immutable_unaccent` + tablas e índices. |
| `init/01_unaccent.sql` | Solo `unaccent` + `immutable_unaccent` (por si quieres ejecutarlo aparte). |
| `migrations/V001_initial_gangabot_schema.sql` | **Migración inicial recomendada para producción**: tablas `_gangabot_schema_migrations`, `category`, `deal`, `deal_event` + FK e índices. Idempotente. |
| `scripts/rename-typeorm-camelcase-columns.sql` | **Solo bases legacy**: renombra columnas camelCase → snake_case si TypeORM ya creó tablas con nombres antiguos. |

## Navicat

1. Conecta al servidor y selecciona la base (p. ej. `gangabot`).
2. Abre **Query** / **Consola SQL**.
3. Según el caso:
   - **Base nueva o producción (sin depender de `synchronize`)**: abre y ejecuta el fichero `migrations/V001_initial_gangabot_schema.sql` (o `install_all.sql` si también quieres `unaccent` en el mismo paso).
   - **Base antigua con error al arrancar por columnas duplicadas / `old_price` null**: abre y ejecuta `scripts/rename-typeorm-camelcase-columns.sql` **una vez**, luego reinicia la API.
4. Confirma con:

```sql
SELECT version, applied_at FROM _gangabot_schema_migrations ORDER BY applied_at;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ( 'category', 'deal', 'deal_event' );
```

## Línea de comandos (psql)

Ajusta usuario, host y puerto (p. ej. Docker `30432` → `5432` en el contenedor).

```bash
# Solo esquema inicial (producción)
psql "postgresql://USER:PASS@localhost:PORT/gangabot" -f sql/migrations/V001_initial_gangabot_schema.sql

# Instalación completa (dev: unaccent + esquema)
psql "postgresql://USER:PASS@localhost:PORT/gangabot" -f sql/install_all.sql

# Renombrado legacy (si aplica)
psql "postgresql://USER:PASS@localhost:PORT/gangabot" -f sql/scripts/rename-typeorm-camelcase-columns.sql
```

## Producción

1. Haz **backup** de la base.
2. Ejecuta `migrations/V001_initial_gangabot_schema.sql` en la base de producción (sesión con permisos DDL).
3. En la app Nest, usa **`synchronize: false`** contra esa base y deja el esquema bajo control de SQL/migraciones.
4. El registro en `_gangabot_schema_migrations` con versión `V001_initial_gangabot_schema` indica que el script se aplicó (inserción idempotente).

## Desarrollo con TypeORM `synchronize: true`

- Puedes dejar que TypeORM cree/ajuste tablas, pero **cualquier cambio de nombres de columna** puede requerir el script de **rename** o una migración nueva, no solo sync.
- Para alinear con SQL: tras `V001`, el esquema debería coincidir con las entidades actuales (columnas `*_` en PG, propiedades camelCase en TypeScript).

## Requisitos

- **PostgreSQL 13+** (usa `gen_random_uuid()` en el núcleo). Versiones anteriores: instala/activa `pgcrypto` o sustituye por `uuid-ossp`.
- La extensión `unaccent` requiere permisos suficientes (a veces solo superusuario); si falla, el API puede funcionar sin búsqueda sin acentos hasta que la instales a mano.

## Notas

- Este árbol sustituye scripts copiados de otros proyectos (intranet, empresas, etc.): el único dominio aquí es **Ganga Bot**.
- No ejecutes `rename-typeorm-camelcase-columns.sql` en una base creada **solo** con `V001` (ya está en snake_case).
