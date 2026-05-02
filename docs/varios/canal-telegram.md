# Canal de Telegram — Ganga Bot

Referencia del canal público donde se publican las ofertas.

| Campo | Valor |
|--------|--------|
| **Nombre de usuario** | `@gangabotapp` |
| **URL pública (para enlaces y Amazon Afiliados)** | [https://t.me/gangabotapp](https://t.me/gangabotapp) |
| Vista web alternativa | `https://web.telegram.org/k/#@gangabotapp` (equivale al mismo canal) |

## Bot de Telegram (API)

| Campo | Valor |
|--------|--------|
| **Username** | [@ganga_ofertas_bot](https://t.me/ganga_ofertas_bot) |
| **`TELEGRAM_BOT_TOKEN`** | Lo entrega @BotFather; **solo** en `.env` local, nunca en el repositorio ni en chats públicos. Si el token se expone, revócalo en @BotFather y genera uno nuevo. |

El bot debe ser **administrador** del canal `@gangabotapp` (mismo apartado que arriba).

## Backend (`.env`)

- **`TELEGRAM_CHANNEL_ID`**: debe ser el identificador **numérico** del canal (ej. `-1001234567890`), **no** el `@gangabotapp`. Obténlo cuando el bot sea administrador del canal (mensaje en el canal → webhook / `getUpdates`, o herramientas que expongan `chat.id`).
- El bot debe ser **administrador** del canal con permiso de **publicar mensajes**.

## Siguiente paso típico

Crear o configurar el **bot** en [@BotFather](https://t.me/BotFather), añadirlo como admin del canal y rellenar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_WEBHOOK_SECRET` y `TELEGRAM_ADMIN_CHAT_ID` en `.env`.
