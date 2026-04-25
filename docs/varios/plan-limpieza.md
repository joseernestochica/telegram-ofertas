# Plan de limpieza y migración — De Telegram Dating a Bot de ofertas Amazon

> Documento guía por fases para transformar el proyecto actual (NestJS + Angular Mini App para dating) en un **bot de Telegram de ofertas de Amazon** con programa de afiliados, siguiendo el enfoque descrito en `plan-inicial.md`.
>
> Cada fase es **autocontenida**, deja el proyecto **compilando y arrancable**, y se puede commitear de forma independiente.

---

## Índice de fases

| Fase | Objetivo | Estado final |
|------|----------|--------------|
| [Fase 0](#fase-0--preparación-y-salvaguardas) | Preparación, backup y branch de trabajo | Repo con branch nuevo, tag de rescate y build actual verde |
| [Fase 1](#fase-1--eliminación-del-frontend-angular) | Borrar la Mini App Angular (`public/`) | Backend arranca sin `ServeStatic` |
| [Fase 2](#fase-2--eliminación-del-dominio-dating-backend) | Borrar módulos `auth`, `profile`, `location`, `file`, datos `seed` | Nest compila con `common + webhook + send-message` |
| [Fase 3](#fase-3--limpieza-de-dependencias-y-config) | `package.json`, `.env`, scripts, README | Instalación limpia y `.env` nuevo |
| [Fase 4](#fase-4--adaptación-del-núcleo-reutilizable) | Refactor de `webhook` y `send-message` eliminando acoplamiento a Auth/WebApp | Bot responde `/start` sin dating |
| [Fase 5](#fase-5--rebranding-y-documentación) | Renombrar proyecto, README nuevo, colección Bruno | Proyecto presentable |
| [Fase 6](#fase-6--verificación-final-y-merge) | Smoke tests, webhook real, merge a `main` | Base lista para construir el dominio Amazon |

> ⚠️ **Importante**: este documento cubre **solo la limpieza**. La implementación del nuevo dominio (módulos `amazon`, `keepa`, `deals`, `publisher`, `scheduler`) se abordará en un **plan posterior** (`plan-implementacion.md`).

---

## Fase 0 — Preparación y salvaguardas

**Objetivo**: asegurar que podemos revertir sin perder nada y partir de un estado conocido verde.

### Pasos

1. **Verificar estado git**
   ```bash
   git status
   git log -1 --oneline
   ```
   Si hay cambios sin commitear, decidir: commit o stash.

2. **Crear tag de rescate** (punto de retorno por si hay que volver al proyecto dating íntegro):
   ```bash
   git tag archive/dating-bot-pre-cleanup
   git push origin archive/dating-bot-pre-cleanup   # opcional
   ```

3. **Crear branch de trabajo**:
   ```bash
   git checkout -b refactor/amazon-bot-cleanup
   ```

4. **Smoke test inicial** (para tener baseline):
   ```bash
   yarn install
   yarn build
   ```
   Anotar cualquier warning/error preexistente para no confundirlos con los que aparezcan durante la limpieza.

5. **Checklist de exclusiones**: confirmar que `.env`, `node_modules/`, `dist/`, `postgres/` están en `.gitignore` (ya lo están, pero conviene reverificar).

### Criterios de salida
- [ ] Branch `refactor/amazon-bot-cleanup` creado
- [ ] Tag `archive/dating-bot-pre-cleanup` creado
- [ ] `yarn build` pasa en `main` antes de empezar

---

## Fase 1 — Eliminación del frontend Angular

**Objetivo**: eliminar toda la Mini App de Angular (dating) y su servido estático. El bot de ofertas publica en un canal, **no necesita front**.

### Alcance

**Borrar**:
- Carpeta completa `public/` (proyecto Angular: `src/`, `angular.json`, `package.json`, `yarn.lock`, `tsconfig*`, `node_modules`, `dist`).
- Carpeta `static/users/` (avatares de perfil).
- Carpeta `static/products/` (si existe con contenido dating).
- `static/blank.png` si solo se usa como placeholder de perfil.
- Plantillas HTML de dating en `static/tpl/` **excepto** `message-welcome.html` (se reutiliza como base para el nuevo mensaje de bienvenida).

**Conservar**:
- `static/tpl/message-welcome.html` (se reescribirá en Fase 4).

### Pasos

1. Confirmar con `grep` que nada de `src/` referencia `public/`:
   ```bash
   rg -n "public/(dist|src|browser)" src/
   ```
2. Borrar carpetas:
   ```bash
   rm -rf public/ static/users/ static/products/
   ```
3. Quitar `ServeStaticModule` de `src/app.module.ts`:
   - Eliminar import de `@nestjs/serve-static`.
   - Eliminar import de `join`/`path` si solo se usaba para eso.
   - Eliminar el bloque `ServeStaticModule.forRoot({ rootPath: ... })`.
4. Verificar compilación:
   ```bash
   yarn build
   yarn start:dev
   ```
   El backend debe arrancar sin servir nada en `/`.

### Criterios de salida
- [ ] `public/` no existe
- [ ] `ServeStaticModule` eliminado de `app.module.ts`
- [ ] `yarn build` verde
- [ ] Commit: `chore: eliminar frontend Angular de dating`

---

## Fase 2 — Eliminación del dominio dating (backend)

**Objetivo**: borrar todos los módulos Nest que implementan el dominio de citas, dejando solo la infraestructura reutilizable.

### Qué se borra

| Ruta | Motivo |
|------|--------|
| `src/auth/` | JWT/refresh tokens/usuarios; un canal público no necesita auth de usuarios finales |
| `src/profile/` | Entidades dating (`gender`, `horoscope`, `interest`, `look-for`, `occupation`, `school`, `profile`, `gender-preference`) |
| `src/location/` | Países, provincias, ciudades (irrelevante para ofertas) |
| `src/file/` | Subida de imágenes de perfil con Multer (las imágenes de productos vienen por URL) |
| `src/seed/data/` | Catálogos seed de dating (no el módulo, solo los datos) |

### Qué se conserva

- `src/common/` íntegro (`HandleErrorService`, helpers, DTOs paginación).
- `src/webhook/` (se refactoriza en Fase 4).
- `src/send-message/` (se refactoriza en Fase 4).
- `src/seed/` **esqueleto** (`seed.module.ts`, `seed.controller.ts`, `seed.service.ts`) pero vaciando la lógica interna — se reutilizará para sembrar categorías Amazon más adelante.
- `src/app.controller.ts`, `src/app.module.ts`, `src/main.ts` (se editan, no se borran).

### Pasos

1. **Detectar acoplamientos cruzados** antes de borrar:
   ```bash
   rg -n "from 'src/(auth|profile|location|file)" src/
   rg -n "AuthService|ProfileService|LocationService|FileService" src/
   ```
   Anotar cada archivo afectado (sobre todo en `webhook/` y `send-message/`).

2. **Borrar módulos**:
   ```bash
   rm -rf src/auth src/profile src/location src/file src/seed/data
   ```

3. **Editar `src/app.module.ts`**: quitar imports y entradas del array `imports` de:
   `AuthModule`, `ProfileModule`, `LocationModule`, `FileModule`.
   Mantener: `ConfigModule`, `TypeOrmModule`, `CommonModule`, `SeedModule`, `WebhookModule`, `SendMessageModule`.

4. **Romper acoplamiento en `send-message`**:
   - Eliminar inyección de `AuthService` y uso de `CreateUserDto` / `v4 as uuidv4` para creación de usuarios.
   - El servicio debe quedar como cliente puro de Telegram Bot API (`sendMessage`, `sendPhoto`, etc.).
   - Exportar solo métodos genéricos: `sendText(chatId, html)`, `sendPhoto(chatId, photoUrl, caption)`, `sendMessageToChannel(html)`.

5. **Romper acoplamiento en `webhook`**:
   - `handleMessage`: mantener solo `/start` y `/help` (respuesta placeholder).
   - Eliminar cualquier referencia a creación de usuarios, WebApp dating, botones inline de perfiles.
   - `handleCallbackQuery`: dejar el esqueleto vacío (para futuros botones admin).

6. **Vaciar `SeedService`** dejando un método `seed()` no-op que devuelve `{ ok: true }` (o comentar su contenido). Se rehará más adelante.

7. **Borrar entidades de TypeORM huérfanas**: al borrar `auth/` y `profile/`, TypeORM ya no las autocarga. Verificar que `autoLoadEntities: true` no rompe (no debe).

8. **Compilar y arrancar**:
   ```bash
   yarn build
   yarn start:dev
   ```

### Criterios de salida
- [ ] Carpetas `auth/`, `profile/`, `location/`, `file/`, `seed/data/` eliminadas
- [ ] `app.module.ts` solo importa `Config + TypeOrm + Common + Seed + Webhook + SendMessage`
- [ ] `yarn build` verde, `yarn start:dev` arranca y responde en el health endpoint
- [ ] `POST /api/webhook` con payload `/start` responde 200 OK (aunque el contenido sea placeholder)
- [ ] Commit: `refactor: eliminar dominio dating (auth, profile, location, file)`

---

## Fase 3 — Limpieza de dependencias y configuración

**Objetivo**: adelgazar `package.json`, reescribir `.env.template` y dejar la config preparada para el dominio Amazon.

### 3.1 `package.json`

**Eliminar dependencias**:
```
bcrypt, @types/bcrypt
passport, passport-jwt, @types/passport-jwt
@nestjs/jwt, @nestjs/passport
@nestjs/websockets, @nestjs/platform-socket.io
@nestjs/serve-static
country-state-city, i18n-iso-countries, spanishcities
@types/multer
copyfiles               # salvo que se use en algún script
```

**Mantener**:
```
@nestjs/common, @nestjs/core, @nestjs/config, @nestjs/axios,
@nestjs/platform-express, @nestjs/mapped-types, @nestjs/swagger,
@nestjs/typeorm, typeorm, pg,
class-validator, class-transformer,
axios, rxjs, reflect-metadata, uuid
```

**Añadir** (preparando Fase posterior, opcional en esta fase):
```
@nestjs/schedule    # cron jobs
```

**Actualizar** `name` y `description` del `package.json`:
```json
"name": "gangabot",
"description": "Ganga Bot — ofertas Amazon en Telegram (gangabot.com)"
```

### 3.2 `.env.template`

Reescribir con las variables necesarias (las que no se sepan aún, dejarlas vacías con comentario):

```env
# --- Entorno ---
STAGE=dev
PORT=3020

# --- Base de datos ---
DB_HOST=localhost
DB_PORT=30432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gangabot

# --- Telegram ---
TELEGRAM_API_URL=https://api.telegram.org/bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_CHANNEL_ID=        # ej: -1001234567890 (canal donde se publican ofertas)
TELEGRAM_ADMIN_CHAT_ID=     # chat privado del admin

# --- Amazon Afiliados ---
AMAZON_AFFILIATE_TAG=       # Ganga Bot: gangabot06-21 (ver docs/varios/cuenta-amazon-afiliados.md)
AMAZON_MARKETPLACE=www.amazon.es

# --- Keepa (fuente principal de ofertas mientras no haya PA-API) ---
KEEPA_API_KEY=

# --- Amazon PA-API 5.0 (cuando se consigan las 3 ventas) ---
PAAPI_ACCESS_KEY=
PAAPI_SECRET_KEY=
PAAPI_PARTNER_TAG=
PAAPI_HOST=webservices.amazon.es
PAAPI_REGION=eu-west-1
```

Eliminar del `.env` real las variables que ya no aplican (`JWT_SECRET`, `WEBAPP_URL`, etc.).

### 3.3 `docker-compose.yaml`

Renombrar la BD en el servicio `postgres` (`POSTGRES_DB: gangabot`) y el volumen si procede. Mantener Postgres como motor.

### 3.4 Ejecución

```bash
# Quitar node_modules y lockfile para una instalación limpia
rm -rf node_modules
yarn install
yarn build
```

### Criterios de salida
- [ ] `package.json` sin dependencias muertas
- [ ] `yarn install` limpio sin warnings por peer deps inexistentes
- [ ] `.env.template` reescrito
- [ ] `docker compose up -d` levanta la BD con el nuevo nombre
- [ ] Commit: `chore: limpiar dependencias y reescribir .env.template`

---

## Fase 4 — Adaptación del núcleo reutilizable

**Objetivo**: dejar `webhook` y `send-message` como base genérica para el bot de ofertas (sin lógica Amazon todavía, pero preparados).

### 4.1 `send-message/`

- **Eliminar** métodos específicos de dating: `startWebApp`, `sendProfileCard`, cualquier función que renderice perfiles.
- **Dejar** una API mínima y reutilizable:
  ```ts
  sendText(chatId: number | string, html: string, options?): Promise<void>
  sendPhoto(chatId: number | string, photoUrl: string, caption: string, options?): Promise<void>
  sendToChannel(html: string): Promise<void>          // usa TELEGRAM_CHANNEL_ID
  sendPhotoToChannel(photoUrl: string, caption: string, inlineButtons?): Promise<void>
  ```
- Añadir helper interno para construir `reply_markup` con `inline_keyboard` (necesario para el botón "Ver oferta en Amazon").
- Mover la URL de Bot API y el `channelId` a `ConfigService`.

### 4.2 `webhook/`

- Mantener verificación de `secret_token` (ya está bien).
- Reducir `handleMessage` a:
  - `/start` → mensaje de bienvenida (nueva plantilla).
  - `/help` → lista de comandos.
  - Comandos admin (placeholder, se rellenarán más adelante): `/stats`, `/publish`, `/skip` — solo si `message.chat.id === TELEGRAM_ADMIN_CHAT_ID`.
- `handleCallbackQuery`: dejar estructura vacía con `switch` por `data` (para botones admin futuros).

### 4.3 Plantillas

- Reescribir `static/tpl/message-welcome.html` con el copy del nuevo bot:
  > "¡Hola! Este bot publica las mejores ofertas de Amazon en nuestro canal. Únete a [@tu_canal_telegram]."
- Crear `static/tpl/deal.html` (plantilla placeholder de oferta) con marcadores:
  ```html
  #{{category}}
  <b>{{title}}</b>
  ❌ <s>{{oldPrice}}€</s>  ✅ <b>{{newPrice}}€</b> ({{discount}}%)
  🔗 {{affiliateUrl}}
  <i>En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas.</i>
  ```
  (Se usará en la fase de implementación, pero se deja el fichero listo.)

### 4.4 Smoke test manual

```bash
yarn start:dev
# en otra terminal
ngrok http 3020
# registrar webhook apuntando a la URL de ngrok
curl -F "url=https://XXX.ngrok-free.app/api/webhook" \
     -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
     https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook
# enviar /start al bot y verificar respuesta
```

### Criterios de salida
- [ ] `SendMessageService` sin dependencias de `AuthService` ni de `WEBAPP_URL`
- [ ] `WebhookService` solo gestiona `/start`, `/help` y deja hooks para admin
- [ ] Bot responde a `/start` con el nuevo mensaje de bienvenida
- [ ] Commit: `refactor: adaptar webhook y send-message a bot de ofertas`

---

## Fase 5 — Rebranding y documentación

**Objetivo**: dejar el proyecto presentable y alineado con su nuevo propósito.

### Pasos

1. **README.md** — reescribir con:
   - Descripción (bot Telegram de ofertas Amazon con afiliados).
   - Requisitos (Node 22, Postgres, cuenta afiliados Amazon, canal Telegram, bot Telegram, Keepa API).
   - Setup local (`yarn install`, `.env`, `docker compose up -d`, `yarn start:dev`, `ngrok`, `setWebhook`).
   - **Pruebas HTTP con [Bruno](https://www.usebruno.com/)**: abrir la carpeta `bruno/` como colección (no Postman).
   - Variables de entorno documentadas.
   - Roadmap (enlazar `plan-inicial.md` y el futuro `plan-implementacion.md`).

2. **`package.json`**: `name`, `description`, `repository`, `keywords` (`gangabot`, `ganga-bot`, `telegram`, `amazon`, `nestjs`).

3. **Bruno** (sustituye a Postman; no se usará Postman en este proyecto):
   - Crear el directorio **`bruno/`** en la raíz del repo como **colección Bruno** (en la app: *Open Collection* → elegir esa carpeta).
   - Incluir `bruno.json` en la raíz de `bruno/` (metadatos de la colección).
   - Organizar **subcarpetas que reflejen las rutas del API** (prefijo global `api` de Nest), con **un archivo `.bru` por endpoint**:
     ```
     bruno/
     ├── bruno.json
     ├── environments/              # opcional: local.bru con {{baseUrl}}, secretos de prueba
     ├── api/
     │   ├── health/
     │   │   └── get-health.bru     # GET {{baseUrl}}/api/health
     │   └── webhook/
     │       └── post-telegram-update.bru   # POST {{baseUrl}}/api/webhook — cuerpo tipo Update de Telegram (ej. mensaje /start)
     ```
   - Criterio: cada ruta HTTP queda bajo `bruno/api/...` siguiendo el path (`health`, `webhook`, y en el futuro lo que añada el dominio Amazon).
   - Si existe la carpeta `postman/` del proyecto dating, **eliminarla** o archivarla fuera del repo; no mantener colecciones Postman.

4. **`.vscode/`**: revisar que no apunte a rutas del proyecto Angular.

5. **Limpieza final**:
   ```bash
   rm -rf dist/
   yarn build
   ```

### Criterios de salida
- [ ] README nuevo
- [ ] `package.json.name = gangabot`
- [ ] Colección Bruno en `bruno/` con estructura por rutas (`api/health`, `api/webhook`, …)
- [ ] Commit: `docs: rebranding, README y colección Bruno`

---

## Fase 6 — Verificación final y merge

**Objetivo**: validar end-to-end y fusionar a `main`.

### Checklist final

- [ ] `yarn install` limpio (sin peer-deps rotas).
- [ ] `yarn build` verde.
- [ ] `yarn start:dev` arranca sin errores.
- [ ] `docker compose up -d` levanta Postgres y Nest conecta.
- [ ] Webhook registrado con ngrok, bot responde `/start` y `/help`.
- [ ] No quedan imports a `auth/`, `profile/`, `location/`, `file/` (grep limpio).
- [ ] No quedan referencias a `WEBAPP_URL`, `JWT_SECRET` en código.
- [ ] `public/` y `static/users/` no existen.
- [ ] `.env.template` cubre todas las variables que el código lee.

### Merge

```bash
git checkout main
git merge --no-ff refactor/amazon-bot-cleanup
git tag milestone/cleanup-complete
```

### Criterios de salida
- [ ] Branch fusionado a `main`
- [ ] Tag `milestone/cleanup-complete`
- [ ] Proyecto listo para empezar la **fase de implementación** del dominio Amazon

---

## Estructura esperada al final de la limpieza

```
GangaBot/   (nombre lógico del repo / carpeta raíz)
├── docs/
│   └── varios/
│       ├── plan-inicial.md
│       └── plan-limpieza.md    ← este documento
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── common.module.ts
│   │   ├── services/
│   │   ├── helpers/
│   │   ├── decorators/
│   │   ├── dto/
│   │   └── interfaces/
│   ├── seed/                   (esqueleto vacío, sin data/)
│   │   ├── seed.controller.ts
│   │   ├── seed.module.ts
│   │   └── seed.service.ts
│   ├── send-message/
│   │   ├── send-message.module.ts
│   │   ├── send-message.service.ts
│   │   ├── send-message.controller.ts
│   │   └── interfaces/
│   └── webhook/
│       ├── webhook.module.ts
│       ├── webhook.service.ts
│       ├── webhook.controller.ts
│       └── dto/
├── static/
│   └── tpl/
│       ├── message-welcome.html   (reescrito)
│       └── deal.html              (placeholder nuevo)
├── test/
├── bruno/                        (colección Bruno: bruno.json + api/<ruta>/<endpoint>.bru)
├── docker-compose.yaml
├── nixpacks.toml
├── railway.json
├── Procfile
├── package.json                  (adelgazado + renombrado)
├── .env.template                 (reescrito)
├── README.md                     (reescrito)
└── tsconfig*.json
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Romper `webhook` al desacoplar `auth` | Fase 2 fuerza compilar tras cada módulo borrado; revertir con `git restore` si falla |
| Olvidar variables en `.env` que usa el código | Fase 3 incluye grep de `ConfigService.get(` para listar todas |
| Perder trabajo reutilizable de la Mini App | Tag `archive/dating-bot-pre-cleanup` permite recuperarlo cuando se plantee el panel admin |
| TypeORM `synchronize: true` intenta migrar entidades borradas | Recrear BD en local (`docker compose down -v && up -d`) tras Fase 2 |

---

## Siguiente paso tras la limpieza

Crear `docs/varios/plan-implementacion.md` con las fases del **nuevo dominio**:
1. Modelado de `Deal` y `Category` + migraciones.
2. Integración con Keepa (cliente + cron).
3. `PublisherService` (formateo + envío al canal).
4. Comandos admin del bot (`/stats`, `/pending`, `/publish`, `/skip`).
5. Integración con PA-API 5.0 cuando haya 3 ventas.
6. Métricas y panel admin (opcional).
