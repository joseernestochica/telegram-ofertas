-- Actualiza deals generados por el seed de demo con datos falsos en los campos añadidos
-- después del modelo inicial: valoraciones, clics y (opcionalmente) ids de Telegram de prueba.
--
-- Criterio de fila “seed”: JSON `external_payload.demoSeed = true` (insert desde
-- `seedDemoDeals` / `deal-demo.seed.ts`). Si hubo filas antiguas solo con título demo,
-- también coincide `title LIKE '[Demo %'`.
--
-- Uso (ajusta conexión):
--   psql "postgresql://USER:PASS@HOST:PORT/gangabot" -f sql/queries/update-seed-deals-fake-new-columns.sql
--
-- Valores: determinísticos por `id` (reproducibles) vía `hashtext(id::text)`.

UPDATE deal AS d
SET
	rating_stars = round(
		( 3.0 + ( mod( abs( hashtext( d.id::text ) ), 21 ) )::numeric / 10 )::numeric,
		1
	),
	review_count = 50 + mod( abs( hashtext( d.id::text ) ), 24950 ),
	affiliate_click_count = mod( abs( hashtext( d.id::text ) ), 800 ),
	-- Chat/canal de Telegram real usado en dev (ajusta si cambias el canal)
	telegram_published_chat_id = '995263889',
	telegram_published_message_id = 10000 + mod( abs( hashtext( d.id::text ) ), 899000 ),
	telegram_published_is_photo = ( mod( abs( hashtext( d.id::text ) ), 2 ) = 1 )
WHERE
	d.external_payload @> '{"demoSeed": true}'::jsonb
	OR d.title LIKE '[Demo %';

-- Comprobación rápida (opcional):
-- SELECT id, asin, rating_stars, review_count, affiliate_click_count,
--        telegram_published_chat_id, telegram_published_message_id, telegram_published_is_photo
-- FROM deal
-- WHERE external_payload @> '{"demoSeed": true}'::jsonb OR title LIKE '[Demo %'
-- LIMIT 10;
