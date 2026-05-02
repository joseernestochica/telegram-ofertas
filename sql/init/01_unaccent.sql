-- Ganga Bot — extensión unaccent + función immutable_unaccent (opcional)
-- Útil para búsquedas insensibles a acentos si más adelante indexas texto.
-- Requiere permisos para CREATE EXTENSION (a menudo superusuario en la instancia).
-- También incluido de forma idempotente en sql/install_all.sql

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION immutable_unaccent ( text )
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$ SELECT unaccent( $1 ) $$;
