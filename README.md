# Bot de Telegram — ofertas Amazon (NestJS)

Backend NestJS + PostgreSQL para un bot que publica ofertas de Amazon con enlaces de afiliado. La Mini App Angular del proyecto anterior fue eliminada; el foco es el webhook de Telegram y la publicación en canal.

## Requisitos

- **Node.js** 22.x (ver `.nvmrc`)
- **Yarn** 1.x
- **PostgreSQL** 14+ (local recomendado vía Docker)
- Cuenta de **Amazon Afiliados**, canal de Telegram, bot creado con [@BotFather](https://t.me/BotFather), y (más adelante) API **Keepa** u otras fuentes de ofertas según el roadmap

## Configuración local

1. Clonar el repositorio e instalar dependencias:

   ```bash
   yarn install
   ```

2. Copiar variables de entorno:

   ```bash
   cp .env.template .env
   ```

   Rellenar al menos `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, credenciales de Postgres y, cuando toque publicar en canal, `TELEGRAM_CHANNEL_ID` y `TELEGRAM_ADMIN_CHAT_ID` (chat numérico del admin para comandos reservados).

3. Levantar Postgres:

   ```bash
   docker compose up -d
   ```

   El nombre de la base debe coincidir con `DB_NAME` (por defecto en la plantilla: `telegram_amazon`). Si cambias `DB_NAME` respecto a una base anterior, puede hacer falta recrear el volumen (`docker compose down -v`).

   Postgres del `docker-compose` escucha en el host en el puerto **30432** (`30432:5432`); en `.env` usa `DB_PORT=30432`. Si aún hubiera conflicto, cambia ambos (compose + `.env`) a otro puerto libre.

4. Arrancar la API en desarrollo (puerto por defecto **3020** si no defines `PORT`):

   ```bash
   yarn start:dev
   ```

5. **Webhook con ngrok** (ejemplo):

   ```bash
   ngrok http 3020
   ```

   Registrar el webhook (sustituye URL y token):

   ```bash
   curl -F "url=https://TU_SUBDOMINIO.ngrok-free.app/api/webhook" \
        -F "secret_token=TU_TELEGRAM_WEBHOOK_SECRET" \
        "https://api.telegram.org/bot<TU_TELEGRAM_BOT_TOKEN>/setWebhook"
   ```

6. Comprobar salud del servicio: `GET http://localhost:3020/api/health`

## Colección Bruno

Las peticiones HTTP de ejemplo están en la carpeta **`bruno/`**. En [Bruno](https://www.usebruno.com/), *Open Collection* y elige esa carpeta. El entorno `environments/local.bru` define `baseUrl` y `webhookSecret` para las pruebas del webhook.

## Variables de entorno

Resumen (la referencia completa está en `.env.template`):

| Área | Variables |
|------|-----------|
| Entorno | `STAGE`, `PORT` |
| Base de datos | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| Telegram | `TELEGRAM_API_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_ADMIN_CHAT_ID` |
| Amazon / APIs | `AMAZON_*`, `KEEPA_*`, `PAAPI_*` (uso previsto en la fase de implementación) |

## Roadmap

- Visión general: `docs/varios/plan-inicial.md`
- Limpieza y fases ya aplicadas: `docs/varios/plan-limpieza.md`
- Dominio Amazon (ofertas, Keepa, publicador): `docs/varios/plan-implementacion.md` *(cuando exista)*

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `yarn start:dev` | API en modo watch |
| `yarn build` | Compilación a `dist/` |
| `yarn lint` | ESLint |
