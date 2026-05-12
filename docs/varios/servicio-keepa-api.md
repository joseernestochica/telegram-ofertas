# Servicio API Keepa — Ganga Bot

Guía operativa para **contratar**, **configurar** y **activar** el acceso a la API de [Keepa](https://keepa.com) en el proyecto TelegramOfertas / Ganga Bot, alineada con [`plan-implementacion.md`](./plan-implementacion.md) (Fases A y C).

---

## Qué es Keepa en este proyecto

Keepa es la **fuente principal de detección de ofertas** (ASIN, histórico de precios, deals) mientras no esté disponible o no se use del todo Amazon PA-API 5.0. El backend debe llamar a `https://api.keepa.com` con tu clave; cada llamada consume **tokens** del saldo de tu cuenta API.

---

## Estado actual del código en el repositorio

| Elemento | Estado |
| -------- | ------ |
| Variable `KEEPA_API_KEY` en [`.env.template`](../../.env.template) | Definida (vacía por defecto) |
| `Deal.source = keepa` en el modelo | Previsto en [`DealSource`](../../src/deal/entities/deal.enums.ts) |
| Módulo Nest `KeepaModule` / `KeepaService` | **No implementado aún** (Fase C del plan) |
| Cron de ingesta `DealIngestorService` | **No implementado aún** |
| Endpoint `POST /api/deals/ingest` | **No implementado aún** (previsto en el plan) |

Hoy puedes **activar la cuenta y la clave** y **probar la API contra Keepa** con curl o Bruno. La integración automática en Nest llegará al implementar la Fase C.

---

## 1. Alta manual en Keepa (cuenta + API)

Pasos resumidos de la **Fase A.3** del plan:

1. Crear cuenta en [keepa.com](https://keepa.com).
2. Contratar el plan que incluye **acceso API**. En la página [Keepa — API](https://keepa.com/#!api) figuran el **precio mensual actual** y el **ritmo de tokens** del plan (p. ej. orientativamente **~49 €/mes** y **20 tokens por minuto** de recarga en el tier mínimo; Keepa puede cambiar cifras — confirma siempre en el sitio).
3. En el panel de usuario de Keepa, localizar la **API key** y copiarla.

No commitees la clave: solo entorno local (`.env`) y variables secretas del hosting (Railway, Fly, VPS, etc.).

---

## 2. Variables de entorno

### Obligatoria (ya contemplada en el proyecto)

En `.env` (partiendo de `.env.template`):

```env
KEEPA_API_KEY=tu_clave_keepa
```

### Previstas cuando exista el cliente Nest (Fase C)

El plan documenta filtros y cron; cuando se implemente `KeepaService` / ingestor, es habitual exponer algo equivalente a:

```env
# Filtros de negocio (ejemplo según plan-implementacion.md)
DEAL_MIN_DISCOUNT=30
DEAL_MIN_PRICE=5
DEAL_MAX_PRICE=500
DEAL_LOOKBACK_DAYS=14

# Cron del fetcher (ejemplo por defecto del plan)
DEAL_FETCH_CRON=*/30 * * * *
```

Hasta que esas variables existan en código y en `.env.template`, son solo **referencia de diseño**.

Opcionalmente el cliente podría leer una URL base por defecto `https://api.keepa.com` sin variable; si en el futuro se añade `KEEPA_API_BASE_URL`, documentarlo aquí.

---

## 3. Dominio de marketplace (`domain`)

Keepa identifica cada tienda Amazon con un **entero**. Para **Amazon.es** el valor correcto según la referencia oficial de la API es **`9`** (`es`). La tabla habitual es:

| `domain` | Marketplace |
| -------- | ------------- |
| 1 | amazon.com (US) |
| 2 | amazon.co.uk |
| 3 | amazon.de |
| 4 | amazon.fr |
| 5 | amazon.co.jp |
| 6 | amazon.ca |
| 8 | amazon.it |
| **9** | **amazon.es** |
| 10 | amazon.in |
| 11 | amazon.com.mx |

> **Nota:** En [`plan-implementacion.md`](./plan-implementacion.md) aparece `domain 8` junto a “Amazon ES”; en la documentación de Keepa, **8 es Italia** y **9 es España**. Al implementar el cliente, usar **`9`** para Ganga Bot (`AMAZON_MARKETPLACE=www.amazon.es`).

---

## 4. Endpoints HTTP que usará el bot

Base URL: **`https://api.keepa.com`**

| Uso | Ruta (orientativa) | Notas |
| --- | ------------------ | ----- |
| Comprobar saldo / tokens | `GET /token?key=<KEEPA_API_KEY>` | Prueba rápida de que la clave es válida |
| Buscar ofertas (deals) | `GET /deal?...` | Parámetros según docs (incl. `domain`, filtros de categoría, precio, etc.) |
| Detalle de producto por ASIN | `GET /product?...` | Para enriquecer título/imagen si hace falta |

Los parámetros exactos y el **coste en tokens** por petición están en la documentación oficial de Keepa (sección API en el sitio o materiales enlazados desde el panel).

---

## 5. Cómo activar y comprobar el servicio

### 5.1 Rellenar `.env`

```bash
cp .env.template .env   # si aún no existe
# Editar .env y asignar KEEPA_API_KEY
```

### 5.2 Verificación con curl (sin Nest)

Sustituye la clave o usa la variable de entorno cargada en tu shell:

```bash
export KEEPA_API_KEY='tu_clave'
curl -sS "https://api.keepa.com/token?key=${KEEPA_API_KEY}"
```

Respuesta esperada: JSON con información de tokens/saldo (formato según versión actual de la API). Si obtienes error de autenticación o clave inválida, revisa la key en el panel Keepa.

### 5.3 Verificación con Bruno

El plan del proyecto usa **Bruno** (`bruno/`), no Postman.

1. Abre la colección `bruno/`.
2. Crea una petición nueva (por ejemplo `api/keepa/get-token.bru`) o usa el entorno [`environments/local.bru`](../../bruno/environments/local.bru) añadiendo una variable `keepaApiKey`.
3. Petición: `GET https://api.keepa.com/token?key={{keepaApiKey}}`.

Las llamadas directas a Keepa **no pasan** por `ApiKeyGuard` del proyecto; la clave va solo en la query `key=` de Keepa.

### 5.4 Cuando exista la integración Nest

1. `KEEPA_API_KEY` definida y aplicación arrancada (`yarn start:dev`).
2. Llamar al endpoint previsto **`POST /api/deals/ingest`** (con `Authorization: Bearer <API_KEY>` o `x-api-key`, según reglas del repo).
3. Revisar logs: consumo de tokens y errores de rate limit / backoff.

---

## 6. Tokens, límites y buenas prácticas

### Precio y ritmo (referencia)

- El **coste en €** y el **ritmo al que se renuevan los tokens** (p. ej. *X tokens por minuto* en el plan mínimo) los marca Keepa en [keepa.com/#!api](https://keepa.com/#!api); no coinciden con cifras antiguas del repo (~17 €/mes del borrador del plan).
- Ese “tokens por minuto” suele ser la **velocidad de recarga** del saldo, no el coste de una petición concreta. Cada endpoint (`/deal`, `/product`, etc.) **descuenta** una cantidad según su documentación.

### Uso eficiente

- Cada tipo de petición tiene un **coste en tokens** distinto; monitoriza el saldo en el panel Keepa y en logs del cliente.
- Respeta el **límite de ritmo**: si disparas muchas llamadas seguidas, puedes quedarte sin tokens disponibles hasta que suba el saldo minuto a minuto; por eso encajan **ingestas espaciadas** y **backoff** ante errores.
- Implementar **reintentos con backoff** y no disparar ingestas en bucle aislado (el plan sugiere cron tipo `*/30 * * * *`).
- Cachear o deduplicar por **ASIN** (ya previsto en el modelo `Deal`: `asin` único y ventana de republicación).

---

## 7. Mapeo de datos Keepa → modelo `Deal` (recordatorio)

Del plan y comentarios en entidad:

- Valoraciones en escala **0–50** en datos Keepa → persistir **`ratingStars` en 0–5** (dividir entre 10).
- **`reviewCount`** cuando la API o CSV lo expongan (`stats` / campos de recuentos, según documentación).

---

## 8. Documentación externa

- Sitio Keepa: [https://keepa.com](https://keepa.com) — registro, planes y enlace a documentación API desde el área de usuario.
- Plan interno completo: [`plan-implementacion.md`](./plan-implementacion.md) (Fases A.3, C y pendientes).

---

## Checklist rápido

- [ ] Cuenta Keepa + plan API activo  
- [ ] `KEEPA_API_KEY` en `.env` (y secretos del entorno de producción)  
- [ ] `GET /token` correcto con curl o Bruno  
- [ ] Para Amazon.es usar **`domain=9`** en las peticiones `/deal` y `/product`  
- [ ] Tras implementar Fase C: ingest manual vía API protegida y cron configurado  
