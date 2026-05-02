-- =============================================================================
-- Ganga Bot | Renombrar columnas camelCase → snake_case (bases ya creadas por TypeORM)
-- =============================================================================
-- Si synchronize creó columnas como "oldPrice" y luego las entidades pasaron a
-- old_price, TypeORM puede intentar AÑADIR columnas nuevas NOT NULL y fallar.
-- Este script RENOMBRA en sitio; es idempotente (solo renombra si existe el origen).
--
-- Navicat: abre este archivo, selecciona la conexión a la BD `gangabot` y ejecuta.
-- psql:
--   psql "postgresql://USER:PASS@HOST:PORT/gangabot" -f sql/scripts/rename-typeorm-camelcase-columns.sql
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION __rename_col_if_exists (
	regclass_table regclass,
	old_name text,
	new_name text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM pg_attribute a
		WHERE a.attrelid = regclass_table
			AND a.attnum > 0
			AND NOT a.attisdropped
			AND a.attname = old_name::name
	) THEN
		EXECUTE format( 'ALTER TABLE %s RENAME COLUMN %I TO %I', regclass_table, old_name, new_name );
	END IF;
END;
$$;

SELECT __rename_col_if_exists ( 'public.category'::regclass, 'amazonNodeId', 'amazon_node_id' );

SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'imageUrl', 'image_url' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'categoryId', 'category_id' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'oldPrice', 'old_price' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'newPrice', 'new_price' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'discountPct', 'discount_pct' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'affiliateUrl', 'affiliate_url' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'detectedAt', 'detected_at' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'publishedAt', 'published_at' );
SELECT __rename_col_if_exists ( 'public.deal'::regclass, 'externalPayload', 'external_payload' );

SELECT __rename_col_if_exists ( 'public.deal_event'::regclass, 'dealId', 'deal_id' );
SELECT __rename_col_if_exists ( 'public.deal_event'::regclass, 'createdAt', 'created_at' );

DROP FUNCTION __rename_col_if_exists ( regclass, text, text );

COMMIT;
