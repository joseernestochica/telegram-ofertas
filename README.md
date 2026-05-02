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

5. Comprobar salud local: `GET http://localhost:3020/api/health`

### Webhook de Telegram en local con ngrok

Telegram solo puede enviar updates a una URL **HTTPS pública**. En tu máquina usas **ngrok** para exponer el puerto donde corre Nest (p. ej. **3020**).

**Prerrequisitos:** `.env` con `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` (el mismo valor usarás en `setWebhook`), API ya arrancada con `yarn start:dev`.

1. **Terminal 1 — Nest** (déjala abierta):

   ```bash
   yarn start:dev
   ```

2. **Terminal 2 — túnel ngrok** hacia el mismo puerto que usa Nest:

   ```bash
   ngrok http 3020
   ```

   Si tu `PORT` en `.env` es otro, sustituye `3020` por ese valor.

3. En la salida de ngrok, copia la URL **HTTPS** de **Forwarding** (ej. `https://abcd-12-34-56.ngrok-free.app`). En el plan gratuito la URL **cambia** al reiniciar ngrok.

4. **Registrar el webhook** en Telegram (una línea; sustituye la URL del túnel y los secretos):

   ```bash
   curl -F "url=https://TU_SUBDOMINIO.ngrok-free.app/api/webhook" \
        -F "secret_token=TU_TELEGRAM_WEBHOOK_SECRET" \
        "https://api.telegram.org/bot<TU_TELEGRAM_BOT_TOKEN>/setWebhook"
   ```

   - La ruta debe ser exactamente **`/api/webhook`** (Nest usa prefijo global `api` y el controlador `webhook`).
   - `secret_token` debe coincidir carácter a carácter con **`TELEGRAM_WEBHOOK_SECRET`** del `.env`.

5. **Comprobar** que Telegram tiene bien la URL:

   ```bash
   curl -s "https://api.telegram.org/bot<TU_TELEGRAM_BOT_TOKEN>/getWebhookInfo"
   ```

   Revisa que `url` sea tu `https://…/api/webhook` y que `last_error_message` esté vacío o sin errores recientes.

6. **Probar:** en Telegram, chat **privado** con **`@ganga_ofertas_bot`**, envía **`/start`**. En la terminal de Nest deberían verse logs; el bot debe responder según `WebhookService` / plantilla de bienvenida.

**Notas:**

- Tras **parar o reiniciar** ngrok, la URL HTTPS suele cambiar: vuelve a ejecutar el **`curl` de `setWebhook`** con la nueva URL.
- Si ngrok pide autenticación: `ngrok config add-authtoken <token>` (cuenta gratuita en [dashboard.ngrok.com](https://dashboard.ngrok.com)).
- Cuando despliegues en **producción**, sustituye la URL de ngrok por tu dominio (p. ej. `https://gangabot.com/api/webhook`) y registra de nuevo el webhook.

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
