-- =============================================================================
-- Ganga Bot | V001 — Esquema inicial (producción y bases nuevas sin TypeORM sync)
-- =============================================================================
-- Requisitos: PostgreSQL 13+ (gen_random_uuid en el núcleo). BD vacía o sin estas tablas.
-- Idempotente: CREATE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
-- Tras aplicar, desactiva synchronize en prod y alinea entidades TypeORM con este esquema.
-- =============================================================================

BEGIN;

-- Registro de migraciones aplicadas (ejecutar una vez por entorno)
CREATE TABLE IF NOT EXISTS _gangabot_schema_migrations (
	version VARCHAR(128) PRIMARY KEY,
	applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Tablas ---

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
