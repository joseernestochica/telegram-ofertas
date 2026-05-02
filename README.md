# Ganga Bot

Backend **NestJS** + **PostgreSQL** para **Ganga Bot**: bot de Telegram que publica ofertas de Amazon con enlaces de afiliado. Dominio del proyecto: **[gangabot.com](https://gangabot.com)**.

## Requisitos

- **Node.js** 22.x (ver `.nvmrc`)
- **Yarn** 1.x
- **PostgreSQL** 14+ (local recomendado vía Docker; base por defecto: **`gangabot`**)
- Cuenta de **Amazon Afiliados**, canal de Telegram, bot con [@BotFather](https://t.me/BotFather), y (más adelante) API **Keepa** según el roadmap

## Configuración local

1. Clonar el repositorio e instalar dependencias:

   ```bash
   yarn install
   ```

2. Copiar variables de entorno:

   ```bash
   cp .env.template .env
   ```

   Rellenar al menos `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, credenciales de Postgres (`DB_NAME=gangabot` por defecto) y, cuando publiques en canal, `TELEGRAM_CHANNEL_ID` y `TELEGRAM_ADMIN_CHAT_ID`.

3. Levantar Postgres:

   ```bash
   docker compose up -d
   ```

   El contenedor se llama **`gangabot-postgres`**. El nombre de la base debe coincidir con `DB_NAME` (plantilla: **`gangabot`**). Si cambias `DB_NAME` respecto a una base anterior, puede hacer falta recrear el volumen (`docker compose down -v`).

   Postgres del `docker-compose` escucha en el host en el puerto **30432** (`30432:5432`); en `.env` usa `DB_PORT=30432`. Si hubiera conflicto, cambia ambos (compose + `.env`) a otro puerto libre.

4. Arrancar la API en desarrollo (puerto por defecto **3020** si no defines `PORT`):

   ```bash
   yarn start:dev
   ```

5. **Webhook** en local con ngrok (ejemplo):

   ```bash
   ngrok http 3020
   ```

   En **producción** el webhook debería apuntar a tu API pública, p. ej. `https://gangabot.com/api/webhook` o `https://api.gangabot.com/api/webhook` según cómo montes DNS y proxy.

   ```bash
   curl -F "url=https://TU_TUNEL.ngrok-free.app/api/webhook" \
        -F "secret_token=TU_TELEGRAM_WEBHOOK_SECRET" \
        "https://api.telegram.org/bot<TU_TELEGRAM_BOT_TOKEN>/setWebhook"
   ```

6. Comprobar salud: `GET http://localhost:3020/api/health`

## Colección Bruno

Las peticiones HTTP de ejemplo están en **`bruno/`** (colección nombrada **Ganga Bot**). En [Bruno](https://www.usebruno.com/), *Open Collection* y elige esa carpeta. El entorno `environments/local.bru` define `baseUrl` y `webhookSecret`.

## Variables de entorno

Resumen (detalle en `.env.template`):

| Área | Variables |
|------|-----------|
| App | `STAGE`, `PORT`, `APP_PUBLIC_URL` (p. ej. `https://gangabot.com`) |
| Base de datos | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (`gangabot`) |
| Telegram | `TELEGRAM_API_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_ADMIN_CHAT_ID` |
| Amazon / APIs | `AMAZON_*`, `KEEPA_*`, `PAAPI_*` |

## Roadmap

- Visión de negocio: `docs/varios/plan-inicial.md`
- Cuenta Amazon Afiliados (tag, enlaces, capturas): `docs/varios/cuenta-amazon-afiliados.md`
- Canal Telegram público (`@gangabotapp`): `docs/varios/canal-telegram.md`
- Limpieza del repo: `docs/varios/plan-limpieza.md`
- Implementación técnica (Ganga Bot): `docs/varios/plan-implementacion.md`

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `yarn start:dev` | API en modo watch |
| `yarn build` | Compilación a `dist/` |
| `yarn lint` | ESLint |
