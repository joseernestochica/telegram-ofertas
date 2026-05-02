-- =============================================================================
-- Ganga Bot (TelegramOfertas) — Instalación SQL completa (desarrollo / desde cero)
-- =============================================================================
-- Incluye: extensión opcional unaccent + esquema inicial (category, deal, deal_event).
-- Idempotente. Ejecutar sobre la base `gangabot` (o la que uses).
--
-- Navicat: conéctate a la BD, abre este archivo o pega todo el contenido y ejecuta.
-- psql:
--   psql "postgresql://USER:PASS@HOST:PORT/gangabot" -f sql/install_all.sql
--
-- Producción: suele preferirse solo `migrations/V001_initial_gangabot_schema.sql`
-- si no necesitas búsqueda sin acentos todavía.
-- =============================================================================

-- ----- 1) Opcional: unaccent (requiere permisos; si falla, ver sql/init/01_unaccent.sql) -----
DO $$
BEGIN
	CREATE EXTENSION IF NOT EXISTS unaccent;
EXCEPTION
	WHEN insufficient_privilege THEN
		RAISE NOTICE 'No se pudo crear unaccent (¿superusuario?). Omítelo o ejecuta manualmente.';
	WHEN OTHERS THEN
		RAISE NOTICE 'Extensión unaccent: %', SQLERRM;
END $$;

DO $$
BEGIN
	CREATE OR REPLACE FUNCTION immutable_unaccent ( text )
	RETURNS text
	LANGUAGE sql
	IMMUTABLE
	AS $func$
		SELECT unaccent( $1 )
	$func$;
EXCEPTION
	WHEN OTHERS THEN
		RAISE NOTICE 'No se pudo crear immutable_unaccent (¿falta extensión unaccent?). %', SQLERRM;
END $$;

-- ----- 2) Esquema Ganga Bot (mismo núcleo que migrations/V001_initial_gangabot_schema.sql) -----

BEGIN;

CREATE TABLE IF NOT EXISTS _gangabot_schema_migrations (
	version VARCHAR(128) PRIMARY KEY,
	applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR NOT NULL,
	slug VARCHAR NOT NULL,
	hashtag VARCHAR NOT NULL,
	amazon_node_id VARCHAR NULL,
	CONSTRAINT uq_category_name UNIQUE ( name ),
	CONSTRAINT uq_category_slug UNIQUE ( slug )
);

CREATE TABLE IF NOT EXISTS deal (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	asin VARCHAR(32) NOT NULL,
	title TEXT NOT NULL,
	image_url TEXT,
	category_id UUID,
	currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
	old_price DOUBLE PRECISION NOT NULL,
	new_price DOUBLE PRECISION NOT NULL,
	discount_pct DOUBLE PRECISION NOT NULL,
	affiliate_url TEXT NOT NULL,
	source VARCHAR(16) NOT NULL,
	status VARCHAR(16) NOT NULL,
	detected_at TIMESTAMPTZ NOT NULL,
	published_at TIMESTAMPTZ,
	external_payload JSONB,
	CONSTRAINT fk_deal_category FOREIGN KEY ( category_id ) REFERENCES category ( id ) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_deal_asin ON deal ( asin );
CREATE INDEX IF NOT EXISTS idx_deal_status_detected_at ON deal ( status, detected_at );
CREATE INDEX IF NOT EXISTS idx_deal_published_at ON deal ( published_at );

CREATE TABLE IF NOT EXISTS deal_event (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	deal_id UUID NOT NULL,
	type VARCHAR(32) NOT NULL,
	metadata JSONB,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT fk_deal_event_deal FOREIGN KEY ( deal_id ) REFERENCES deal ( id ) ON DELETE CASCADE
);

INSERT INTO _gangabot_schema_migrations ( version )
VALUES ( 'V001_initial_gangabot_schema' )
ON CONFLICT ( version ) DO NOTHING;

COMMIT;
