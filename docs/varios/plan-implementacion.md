# Plan de implementación — Ganga Bot

> **Aplicación:** Ganga Bot — bot de Telegram de ofertas Amazon (programa de afiliados).  
> **Dominio de producción:** [gangabot.com](https://gangabot.com) (API, webhooks, futura landing).  
> **Base de datos (nombre por defecto):** `gangabot` (Postgres, alineado con la marca).
>
> Documento guía por fases para construir el dominio del bot (módulos `deal`, `category`, `keepa`, `amazon`, `publisher`, `scheduler`, `admin`) sobre el esqueleto ya limpio (`common + webhook + send-message + seed`).
>
> Referencias previas: `plan-inicial.md` (visión, modelo de negocio) y `plan-limpieza.md` (base técnica).
>
> Convenciones:
> - Cada **fase** deja el proyecto compilando y arrancable.
> - Las **acciones manuales** del usuario (registros, claves, cuentas) van marcadas con 🧑‍💻.
> - Las **acciones automatizables** (código/migraciones/scripts) van marcadas con 🤖.
> - Pruebas manuales con **Bruno** (carpeta `bruno/`). Nada de Postman.

---

## Índice

| Fase | Objetivo | Estado final |
|------|----------|--------------|
| [Fase A](#fase-a--cuentas-y-preparativos-manuales) | Cuentas externas y claves (Amazon Afiliados, Telegram, Keepa) | Todas las credenciales listas en `.env` |
| [Fase B](#fase-b--modelado-de-datos-deal-category) | Entidades `Category`, `Deal`, `DealEvent` + seed de categorías | Migraciones verdes, endpoints CRUD mínimos |
| [Fase C](#fase-c--cliente-keepa-y-fetcher-de-ofertas) | Integración con Keepa y detector de chollos | Cron descarga candidatos y persiste `Deal` en `PENDING` |
| [Fase D](#fase-d--enlaces-de-afiliado-y-formateo-amazon) | Utilidades Amazon (tag, URL, aviso legal) + plantilla `deal.html` | `PublisherService` genera HTML listo |
| [Fase E](#fase-e--publisher-al-canal--cola-de-publicación) | Envío al canal con `send-message`, throttling, dedupe | Publicación automática programada |
| [Fase F](#fase-f--comandos-admin-del-bot) | `/stats`, `/pending`, `/publish <id>`, `/skip <id>`, `/pause` | Admin opera desde chat privado |
| [Fase G](#fase-g--observabilidad-mínima-y-métricas) | Logs estructurados, tabla de `PublishedDeal`, contador clics (opcional) | Panel mínimo de salud |
| [Fase H](#fase-h--migración-a-pa-api-50) | Cuando haya 3 ventas cualificadas, conectar Amazon PA-API | Fuente oficial + fallback a Keepa |
| [Fase I](#fase-i--despliegue-hosting-y-ci) | Deploy en hosting barato + webhook productivo + backups | Bot corriendo 24/7 |
| [Fase J](#fase-j--operación-y-mejoras) | Rutina diaria, A/B de copys, categorías con mejor conversión | Iteración continua |

---

## Fase A — Cuentas y preparativos manuales

**Objetivo**: tener todas las cuentas, tokens y credenciales necesarias **antes** de implementar nada más.

### A.1 Amazon Afiliados 🧑‍💻

1. Crear/usar una cuenta normal de Amazon.
2. Ir a [afiliados.amazon.es](https://afiliados.amazon.es) y solicitar acceso como **Amazon Associates**.
3. Declarar el **canal de Telegram** como plataforma de promoción (todavía vacío, no pasa nada).
4. Rellenar datos fiscales (DNI, IBAN, dirección).
5. Anotar tu **tag** (ej.: `tucanal-21`) → va a `AMAZON_AFFILIATE_TAG` en `.env`.
6. ⚠️ Recordar: a partir de la aprobación, cuentan 180 días para lograr **3 ventas cualificadas**; si no, se suspende la cuenta.

**Criterios de salida**:
- [ ] Tag de afiliado activo.
- [ ] Aviso legal apuntado literal: *"En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas."*

### A.2 Canal de Telegram + bot 🧑‍💻

1. Crear el **canal público** (o privado al principio) desde la app de Telegram.
2. Crear el **bot** con [@BotFather](https://t.me/BotFather): comando `/newbot` → obtienes `TELEGRAM_BOT_TOKEN`.
3. Añadir el bot al canal como **administrador** con permiso para publicar mensajes.
4. Obtener el `chat_id` del canal (p. ej. enviando un mensaje al canal y consultando `getUpdates`, o con un bot auxiliar tipo [@RawDataBot](https://t.me/RawDataBot)). Formato típico: `-100xxxxxxxxxx`.
5. Obtener tu propio `chat_id` privado (hablando al bot y mirando logs/Bruno del webhook) → `TELEGRAM_ADMIN_CHAT_ID`.
6. Generar un `TELEGRAM_WEBHOOK_SECRET` (hex de 32+ chars) y registrarlo más tarde con `setWebhook`.

**Criterios de salida**:
- [ ] `.env` con `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`.
- [ ] Bot es admin del canal y puede publicar.

### A.3 Keepa 🧑‍💻

1. Crear cuenta en [keepa.com](https://keepa.com).
2. Contratar el plan **API** (~17€/mes; precio según uso de *tokens*).
3. Obtener `KEEPA_API_KEY` desde el panel → va a `.env`.
4. Revisar documentación de endpoints clave que usaremos:
   - `/deal` (búsqueda de chollos filtrados)
   - `/product` (detalle de producto por ASIN, si hace falta)

**Criterios de salida**:
- [ ] `KEEPA_API_KEY` en `.env`.
- [ ] Prueba manual en Bruno: `GET https://api.keepa.com/token?key={{KEEPA_API_KEY}}` responde con tokens disponibles.

### A.4 Repositorio y entorno local 🤖

1. Branch `feature/gangabot-domain` desde `main`.
2. Confirmar que `docker compose up -d` levanta Postgres (puerto host **30432**).
3. `yarn start:dev` arranca y `GET http://localhost:3020/api/health` devuelve `ok`.

### A.5 Checklist de `.env` final de dev

```env
STAGE=dev
PORT=3020

DB_HOST=localhost
DB_PORT=30432
DB_USER=...
DB_PASSWORD=...
DB_NAME=gangabot

TELEGRAM_API_URL=https://api.telegram.org/bot
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
TELEGRAM_CHANNEL_ID=-100...
TELEGRAM_ADMIN_CHAT_ID=...

AMAZON_AFFILIATE_TAG=tucanal-21
AMAZON_MARKETPLACE=www.amazon.es

KEEPA_API_KEY=...
# PA-API: rellenar en Fase H
```

---

## Fase B — Modelado de datos (`Deal`, `Category`)

**Objetivo**: definir las entidades del dominio y persistirlas con TypeORM.

### B.1 Entidades 🤖

Ubicación sugerida: `src/deal/entities/`, `src/category/entities/`.

- **`Category`**:
  - `id` (uuid), `name` (único), `slug`, `hashtag` (ej. `#Electronica`), `amazonNodeId?` (nodo de Amazon).
- **`Deal`** (núcleo):
  - `id` (uuid), `asin` (único, indexado), `title`, `imageUrl?`, `categoryId` (FK), `currency` (`EUR`), `oldPrice`, `newPrice`, `discountPct` (calculado), `affiliateUrl`, `source` (`keepa` | `manual` | `paapi`), `status` (`PENDING` | `APPROVED` | `PUBLISHED` | `SKIPPED` | `EXPIRED`), `detectedAt`, `publishedAt?`, `externalPayload` (jsonb, respuesta bruta de la fuente).
  - Índices: `(status, detectedAt)`, `(asin)`, `(publishedAt)`.
  - Regla de dedupe: mismo `asin` no se re-publica si fue `PUBLISHED` en los últimos **N días** (configurable, p. ej. 14).
- **`DealEvent`** (auditoría):
  - `id`, `dealId` (FK), `type` (`detected` | `approved` | `published` | `skipped` | `error`), `metadata` (jsonb), `createdAt`.

### B.2 Módulos y repositorios 🤖

- `CategoryModule`, `DealModule` con `TypeOrmModule.forFeature([...])`.
- Servicios: `CategoryService`, `DealService` (CRUD básico + `markAsPublished`, `markAsSkipped`, `upsertByAsin`).

### B.3 Seed de categorías 🤖

- Reactivar `SeedService` para sembrar **categorías generalistas** (Electrónica, Hogar, Moda, Belleza, Juguetes, Deportes, Informática, Libros…).
- Endpoint temporal: `GET /api/seed/categories` (solo en `STAGE=dev`).

### B.4 Migraciones vs `synchronize` 🤖

Hoy el proyecto usa `synchronize: true`. Recomendado:

- Mantener `synchronize: true` **solo en dev**.
- Preparar ya la config para **TypeORM migrations** en prod (`synchronize: false` cuando `STAGE=prod`).
- Script npm: `yarn typeorm migration:generate ...` (se documenta en esta fase).

### B.5 Bruno 🤖

Añadir en `bruno/api/`:
- `categories/list.bru` → `GET /api/categories`
- `deals/list.bru` → `GET /api/deals?status=PENDING`
- `deals/get-by-id.bru` → `GET /api/deals/:id`

**Criterios de salida**:
- [ ] Migración/`synchronize` crea las tres tablas sin errores.
- [ ] Seed de categorías disponible en dev.
- [ ] Bruno: puedo listar categorías y deals vacíos.

---

## Fase C — Cliente Keepa y fetcher de ofertas

**Objetivo**: poblar `Deal` automáticamente con chollos detectados por Keepa.

### C.1 Cliente HTTP Keepa 🤖

- Nuevo módulo `KeepaModule` con `KeepaService` inyectable.
- Base URL `https://api.keepa.com`, domain `8` (Amazon ES).
- Métodos:
  - `getDeals(filter)` → wrapper sobre `/deal` con filtros configurables (categoría, mínimo descuento %, precio mínimo/máximo, rango histórico).
  - `getProduct(asin)` → opcional para completar título/imagen si Keepa no los devuelve.
- Manejo de **tokens Keepa** (cuánto cuesta cada llamada) con logging.
- Retries con backoff exponencial (usar `axios` + `rxjs` o `@nestjs/axios`).

### C.2 Estrategia de filtrado 🤖

Configurable en `.env`:
```
DEAL_MIN_DISCOUNT=30        # %
DEAL_MIN_PRICE=5            # €
DEAL_MAX_PRICE=500          # €
DEAL_LOOKBACK_DAYS=14       # para dedupe
```

Criterios de aceptación de un `Deal`:
- Descuento real (precio actual < precio medio 90 días × (1 - MIN_DISCOUNT/100)).
- Disponible en Amazon ES (prime opcional).
- No publicado recientemente.
- Categoría mapeada en BD.

### C.3 `DealIngestorService` 🤖

- Llama a `KeepaService.getDeals(...)`.
- Para cada candidato:
  - `upsertByAsin` en estado `PENDING`.
  - Persiste `DealEvent` tipo `detected`.
- Devuelve estadísticas (insertados, ignorados por dedupe, errores).

### C.4 Scheduler 🤖

- Añadir `@nestjs/schedule` (ya se incluyó como dependencia).
- Cron configurable (`DEAL_FETCH_CRON`, por defecto `*/30 * * * *`).
- Job llama a `DealIngestorService.run()` y registra métricas.

### C.5 Endpoints admin 🤖

- `POST /api/deals/ingest` (dev/admin) fuerza una ejecución.
- `GET /api/deals?status=PENDING&limit=20`.

### C.6 Bruno 🤖

- `bruno/api/deals/ingest-now.bru`
- `bruno/api/deals/list-pending.bru`

**Criterios de salida**:
- [ ] Ejecutar `ingest-now` llena la tabla `deal` con candidatos reales (token Keepa consumido).
- [ ] Ejecuciones repetidas no duplican (`asin` único + dedupe por ventana).
- [ ] Logs indican tokens Keepa consumidos por llamada.

---

## Fase D — Enlaces de afiliado y formateo Amazon

**Objetivo**: dado un `Deal`, producir una **URL de afiliado correcta** y un **HTML listo para Telegram**.

### D.1 Utilidades Amazon 🤖

`src/amazon/amazon.service.ts`:
- `buildAffiliateUrl(asin: string): string` → `https://www.amazon.es/dp/{ASIN}/?tag={AMAZON_AFFILIATE_TAG}`.
- `buildShortUrl(asin)` opcional (reserva para Fase H/PA-API).
- Sanea `AMAZON_MARKETPLACE` desde config.

### D.2 Plantilla `static/tpl/deal.html` 🤖

Ya existe como placeholder. Rellenar marcadores:
```
#{{category}}
<b>{{title}}</b>
❌ <s>{{oldPrice}}€</s>  ✅ <b>{{newPrice}}€</b> ({{discount}}%)
🔗 {{affiliateUrl}}

<i>En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas.</i>
```

### D.3 `DealFormatterService` 🤖

- Rellena la plantilla con los datos del `Deal` y la `Category`.
- Escapa HTML de Telegram (evitar que títulos con `<` rompan parse_mode HTML).
- Devuelve `{ caption, photoUrl, inlineKeyboard }` (inline button: *"Ver en Amazon"* → `affiliateUrl`).

### D.4 Bruno 🤖

- `bruno/api/deals/preview.bru` → `POST /api/deals/:id/preview` devuelve el HTML renderizado sin publicar.

**Criterios de salida**:
- [ ] Preview por API devuelve el mensaje tal y como se publicaría.
- [ ] Manual en Telegram: copiar preview y verificar que parse HTML queda correcto.
- [ ] Incluye obligatoriamente el **aviso legal** Amazon.

---

## Fase E — Publisher al canal + cola de publicación

**Objetivo**: pasar `Deal` de `APPROVED` a `PUBLISHED` enviando al canal.

### E.1 `PublisherService` 🤖

- Depende de `SendMessageService` y `DealFormatterService`.
- Método `publish(deal)`:
  - Si `deal.imageUrl`: `sendPhoto` al canal con caption + inline button.
  - Si no: `sendToChannel` con HTML.
  - Actualiza `deal.status = PUBLISHED`, `publishedAt`.
  - Registra `DealEvent` (`published`).
  - Captura errores Telegram (rate limit 429) y re-encola.

### E.2 Cola de publicación 🤖

Dos modos soportados (configurable):
- **Simple**: cron cada X minutos publica el próximo `APPROVED` (FIFO por `detectedAt`).
- **Spread**: distribuye N publicaciones por día en un rango horario (`PUBLISH_WINDOW_START=09`, `END=22`, `PUBLISH_MAX_PER_DAY=6`).

Variables:
```
PUBLISH_CRON=*/10 * * * *
PUBLISH_MAX_PER_DAY=6
PUBLISH_WINDOW_START=9
PUBLISH_WINDOW_END=22
```

### E.3 Aprobación de `Deal` 🤖

Flujo decidido en Fase F (admin manual vs auto-approve):
- `DEAL_AUTO_APPROVE=true|false`.
- Si `true`: al ingestar pasa directo a `APPROVED`.
- Si `false`: queda `PENDING` hasta que el admin use `/publish <id>` o `/skip <id>`.

Recomendación: **`false` en los primeros meses** para controlar calidad.

### E.4 Endpoints admin 🤖

- `POST /api/deals/:id/approve`
- `POST /api/deals/:id/publish`  (fuerza publicación inmediata)
- `POST /api/deals/:id/skip`

### E.5 Bruno 🤖

- `bruno/api/deals/approve.bru`
- `bruno/api/deals/publish.bru`
- `bruno/api/deals/skip.bru`

**Criterios de salida**:
- [ ] Con un `Deal` en `APPROVED`, el cron publica en el canal real.
- [ ] Respeta `PUBLISH_MAX_PER_DAY`.
- [ ] Rate limits de Telegram manejados (log + backoff).

---

## Fase F — Comandos admin del bot

**Objetivo**: operar el bot desde tu chat privado con Telegram sin abrir la API.

### F.1 Guard de admin 🤖

En `WebhookService.handleMessage`, solo procesar comandos admin si `message.chat.id === TELEGRAM_ADMIN_CHAT_ID`.

### F.2 Comandos 🤖

| Comando | Efecto |
|---------|--------|
| `/stats` | Número de deals por estado, publicaciones del día, tokens Keepa estimados |
| `/pending` | Últimos 5 `PENDING` con botones inline `[Publicar]` / `[Saltar]` |
| `/publish <id>` | Publica deal por id corto |
| `/skip <id>` | Marca `SKIPPED` |
| `/pause` | Desactiva cron de publicación |
| `/resume` | Reactiva cron |
| `/help` | Recordatorio de comandos |

### F.3 Callback queries 🤖

- `WebhookService.handleCallbackQuery`: `data` con formato `deal:publish:<id>` / `deal:skip:<id>`.
- Responder con `answerCallbackQuery` para quitar el reloj de carga en el botón.

### F.4 Bruno 🤖

- `bruno/api/webhook/post-admin-stats.bru` (simula `/stats`).
- `bruno/api/webhook/post-admin-callback.bru` (simula un click en inline keyboard).

**Criterios de salida**:
- [ ] Desde tu Telegram puedes ver pendientes y publicar/skipear con botones.
- [ ] Comandos ignorados si los envía otro chat.

---

## Fase G — Observabilidad mínima y métricas

**Objetivo**: saber qué está pasando sin meterte en la BD a mano.

### G.1 Logs estructurados 🤖

- Usar el Logger de Nest con contexto por módulo.
- Nivel configurable por `LOG_LEVEL`.
- En producción: formato JSON para que cualquier agregador (Grafana Loki, BetterStack, Logtail free tier) lo ingiera.

### G.2 Endpoint `/api/stats` 🤖

- Deals por estado (últimos 7/30 días).
- Publicaciones por día.
- Tokens Keepa consumidos por día (si los guardas en `DealEvent.metadata`).
- Uptime básico.

### G.3 Health check extendido 🤖

Ampliar `AppController` para comprobar:
- DB conectada (ya lo hace).
- Keepa alcanzable (cacheado 5 min).
- Telegram alcanzable (`getMe`).

### G.4 Alertas mínimas 🧑‍💻

- Configurar un job que envíe a `TELEGRAM_ADMIN_CHAT_ID` un resumen diario (21:00).
- Errores 3+ veces consecutivas → mensaje inmediato al admin.

**Criterios de salida**:
- [ ] `/api/stats` responde con los contadores clave.
- [ ] Recibes resumen diario en tu chat privado.

---

## Fase H — Migración a PA-API 5.0

**Objetivo**: cuando Amazon te apruebe (3 ventas en 180 días), enriquecer datos y/o sustituir parcialmente a Keepa.

### H.1 Requisitos previos 🧑‍💻

1. Confirmar en el panel de Afiliados que **PA-API** está habilitada.
2. Crear credenciales **Access Key / Secret Key**, anotar `PartnerTag`.
3. Rellenar en `.env`:
   ```
   PAAPI_ACCESS_KEY=...
   PAAPI_SECRET_KEY=...
   PAAPI_PARTNER_TAG=...
   PAAPI_HOST=webservices.amazon.es
   PAAPI_REGION=eu-west-1
   ```

### H.2 `AmazonPaapiService` 🤖

- Módulo `AmazonModule` con cliente firmado (AWS Signature v4).
- Métodos útiles:
  - `getItems([asin])` → title, imágenes, listPrice, offerPrice.
  - `searchItems(keyword, browseNodeId)`.
- Respetar throughput (PA-API tiene cuota; empieza en 1 req/s).

### H.3 Estrategia híbrida 🤖

- **Keepa**: sigue detectando chollos históricos (hace lo que PA-API no hace bien).
- **PA-API**: fuente oficial para título, imagen, precio actual.
- Orden: Keepa detecta ASIN → PA-API enriquece → `DealFormatterService`.

### H.4 Compliance 🤖

- Mantener el **aviso legal** obligatorio en cada publicación.
- Revisar condiciones de uso de PA-API (no cachear precios más de 24 h, no usar en apps de terceros).

**Criterios de salida**:
- [ ] `Deal` creado con `source=paapi` tiene título e imagen correctos.
- [ ] Fallback automático a Keepa si PA-API falla.

---

## Fase I — Despliegue, hosting y CI

**Objetivo**: dejar el bot corriendo 24/7 con coste mínimo.

### I.1 Opciones de hosting (comparativa)

| Opción | Coste | Pros | Contras |
|--------|-------|------|---------|
| **Railway** | $5/mes crédito + *hobby plan* ~$5/mes de uso real | Despliegue desde git, Postgres y webhook HTTPS listos, ya tienes `nixpacks.toml` y `railway.json` en el repo | Precios han subido respecto a la versión free; facturación en USD |
| **Fly.io** | Free tier generoso (3 VMs compartidas pequeñas) + Postgres *shared-cpu-1x* gratis con límites | HTTPS y regiones europeas, CLI cómoda, se paga solo el exceso | Postgres gestionado puede ser lento en el tier gratis; se requiere tarjeta |
| **Render** | Free (servicios duermen a los 15 min) o Starter $7/mes | Despliegue git + Postgres managed; UI simple | El plan gratis se apaga → webhook de Telegram fallaría; necesitas plan de pago |
| **Hetzner Cloud CX22** (VPS) | ~4,5€/mes | **Mejor relación calidad/precio de Europa**, 2 vCPU + 4 GB + 40 GB NVMe, datacenter Alemania/Finlandia | Debes administrar tú (Docker, nginx/caddy, backups) |
| **Contabo VPS S** | ~5–6€/mes | Más RAM/CPU por el precio | Reputación mixta de rendimiento I/O, soporte lento |
| **Oracle Cloud Free Tier** (ARM) | 0€ | 4 vCPU ARM + 24 GB RAM *gratis para siempre* | Aprobación de cuenta complicada; riesgo de reclamación del recurso; imagen ARM |
| **VPS pequeño en OVH/Scaleway** | 3–5€/mes | Europeos, facturación en € | Especificaciones más modestas que Hetzner |

#### Recomendación por perfil

- **Quieres el mínimo esfuerzo de ops**: **Railway** (~5–10 $/mes todo incluido: app + Postgres gestionado). Ya tienes `railway.json` y `nixpacks.toml` → despliegue casi inmediato.
- **Mejor € por recurso y no te asusta un VPS**: **Hetzner CX22** (~4,5€/mes) + Docker Compose con Nest y Postgres en el mismo host. Perfecto para este proyecto.
- **Coste 0 y estás dispuesto al riesgo/ops**: **Oracle Cloud Free Tier** (ARM) si consigues aprovisionar; si no, **Fly.io** free.

> ⚠️ **Render free** y **Railway free** antiguos **hacen sleep**: un webhook de Telegram en un servicio dormido pierde updates. Evita tiers que duermen.

> El plan inicial estimaba ~4€/mes de hosting + 17€/mes de Keepa; con Hetzner CX22 encajas en ese presupuesto.

### I.2 Pasos de despliegue (ejemplo Railway) 🧑‍💻🤖

1. Crear proyecto en Railway, conectar repo GitHub.
2. Añadir servicio **PostgreSQL** (Railway da `DATABASE_URL`; en ese caso habría que adaptar `TypeOrmModule` para aceptar `DATABASE_URL` además de variables sueltas).
3. Variables de entorno: todas las del `.env` de producción (Telegram, Keepa, Amazon, PA-API cuando exista).
4. Build: `nixpacks` (ya configurado).
5. Comando start: `yarn start:prod`.
6. Dominio público `*.up.railway.app` o **dominio propio** `gangabot.com` (~1€/mes en Namecheap/Porkbun) con CNAME al origen que te dé el hosting.
7. Registrar webhook productivo (sustituye si usas subdominio, p. ej. `api.gangabot.com`):
   ```bash
   curl -F "url=https://gangabot.com/api/webhook" \
        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
        "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook"
   ```

### I.3 Pasos de despliegue (ejemplo Hetzner) 🧑‍💻🤖

1. Crear VPS CX22 con Ubuntu 22.04 LTS.
2. Endurecer: usuario no-root, SSH por clave, firewall UFW (solo 22/80/443).
3. Instalar Docker + Docker Compose.
4. Clonar repo, `cp .env.template .env`, rellenar.
5. `docker-compose.prod.yaml` (a crear) con:
   - Servicio `app` (imagen Node 22).
   - Servicio `db` (Postgres persistente en volumen).
   - Servicio `caddy` para TLS automática (Let's Encrypt).
6. Registrar webhook igual que en I.2 apuntando al dominio.
7. Backups: `pg_dump` diario a **Backblaze B2** (~0,005$/GB/mes).

### I.4 CI/CD 🤖

- GitHub Actions básico:
  - `install` + `lint` + `build` en cada PR.
  - Deploy automático a Railway (o SSH a Hetzner) al push a `main`.
- Proteger `main` con reglas del repo (requiere PR aprobado, CI verde).

### I.5 Secretos y seguridad 🧑‍💻

- Nunca commit de `.env`.
- Rotar `TELEGRAM_WEBHOOK_SECRET` si se filtra.
- No exponer `/api/seed` en producción (guard por `STAGE !== 'prod'` o protección por token admin).

**Criterios de salida**:
- [ ] Hosting elegido y documentado en README.
- [ ] Webhook productivo registrado; bot responde desde dominio público.
- [ ] Backups automáticos funcionando y probados (restore en local).

---

## Fase J — Operación y mejoras

**Objetivo**: dejar el bot en piloto automático y mejorar iterando.

### J.1 Rutina diaria 🧑‍💻

- Revisar `/stats` del bot.
- Supervisar pendientes (`/pending`) si `DEAL_AUTO_APPROVE=false`.
- Ajustar filtros cuando los chollos sean pobres o escasos.

### J.2 Iteración de producto 🤖🧑‍💻

- A/B de copys (emoji vs sin emoji, formato precio).
- Publicar a distintas horas y medir crecimiento de suscriptores.
- Afinar categorías con mejor conversión (hay comisiones hasta el 10% en moda y Amazon propio).
- Usar URL shortener propio (`/r/<slug>`) para contar clicks antes de redirigir.

### J.3 Roadmap opcional 🤖

- Panel admin web (reutilizando dependencias Nest/Swagger).
- Segundo canal temático (moda) para comparar rendimiento.
- Integración con Amazon Live Deals / Lightning Deals cuando PA-API lo permita.
- Alertas a usuarios suscritos por keyword (requiere cambiar de canal a chat/grupo y manejar usuarios).

---

## Resumen de acciones manuales (checklist rápido) 🧑‍💻

- [ ] Alta en **afiliados.amazon.es** y anotar tag.
- [ ] Crear **canal de Telegram** y añadir el bot como admin.
- [ ] Crear **bot con BotFather** y guardar `TELEGRAM_BOT_TOKEN`.
- [ ] Obtener `TELEGRAM_CHANNEL_ID` y `TELEGRAM_ADMIN_CHAT_ID`.
- [ ] Generar `TELEGRAM_WEBHOOK_SECRET`.
- [ ] Alta en **Keepa** y plan API → `KEEPA_API_KEY`.
- [ ] Registrar al menos **3 ventas cualificadas** (usando tu propio tag) dentro de los 180 días.
- [ ] Solicitar **PA-API** cuando estén las 3 ventas; guardar credenciales.
- [ ] Elegir **hosting** (Railway / Hetzner / Fly.io) y comprar opcionalmente dominio.
- [ ] Configurar **webhook productivo** con `setWebhook`.
- [ ] Configurar **backups** de Postgres.

## Resumen de acciones automatizables (checklist rápido) 🤖

- [ ] Entidades `Category`, `Deal`, `DealEvent` + migraciones.
- [ ] `SeedService` para categorías.
- [ ] Cliente `KeepaService` + `DealIngestorService` + cron `@nestjs/schedule`.
- [ ] `AmazonService.buildAffiliateUrl`.
- [ ] `DealFormatterService` con plantilla `deal.html` y escape HTML.
- [ ] `PublisherService` con throttling y ventana horaria.
- [ ] Comandos admin en `WebhookService` (chat privado).
- [ ] `/api/stats`, logs estructurados, resumen diario.
- [ ] `AmazonPaapiService` cuando se habilite PA-API.
- [ ] Dockerfile/compose producción, CI/CD, deploy automático.

---

## Siguientes pasos tras este plan

- Empezar **Fase A** (cuentas) en paralelo con **Fase B** (código no bloquea cuentas).
- Tras B y C, ya hay datos en BD sin publicar nada: momento ideal para validar calidad de ofertas sin gastar reputación del canal.
- Ir a **Fase E/F** solo cuando la calidad del ingestor sea aceptable.
- **Hosting** (Fase I) puede hacerse antes de lanzar: Railway de entrada y migrar a Hetzner cuando los costes de Keepa+hosting lo justifiquen.
