# Migraciones — Ganga Bot

## Convención

- Ficheros numerados con prefijo **`Vnnn_descripcion.sql`** (p. ej. `V001_initial_gangabot_schema.sql`).
- Registro global en tabla **`_gangabot_schema_migrations`** (clave `version`).

## V001 — Esquema inicial

**Archivo:** `V001_initial_gangabot_schema.sql`

**Contenido:**

- Tabla `_gangabot_schema_migrations`.
- Tablas `category`, `deal`, `deal_event` con FKs e índices acordes a las entidades Nest/TypeORM.

**Cuándo ejecutarla**

- **Producción** (base nueva o primera vez que pasas de `synchronize` a esquema fijo).
- **Staging** igual que producción.

**Idempotencia:** usa `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` y `INSERT ... ON CONFLICT DO NOTHING` para la versión.

## Bases ya existentes (columnas camelCase)

Si la base se creó con TypeORM con columnas tipo `"oldPrice"` y las entidades pasaron a `old_price`, **no ejecutes V001 encima** sin revisar: puede haber conflicto de objetos.

En ese caso:

1. Backup.
2. Ejecuta **`../scripts/rename-typeorm-camelcase-columns.sql`** para renombrar columnas en sitio.
3. Reinicia la API o aplica V001 solo si faltan tablas (caso mixto: revisar manualmente).

## Futuras migraciones (V002, …)

- Añade un nuevo archivo `V002_*.sql`.
- Incluye cambios DDL incrementales y, al final, inserta la nueva versión en `_gangabot_schema_migrations`.
- Documenta aquí el propósito y dependencias.

## Rollback

No hay rollbacks automáticos en el repo. Para revertir, restaura desde backup o escribe un script `V002_rollback_*.sql` explícito según el cambio.
