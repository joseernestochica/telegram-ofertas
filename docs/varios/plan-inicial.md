# Bot de Telegram para ofertas de Amazon — Resumen y plan de acción

## ¿Qué es y cómo funciona?

El modelo consiste en un canal de Telegram que publica ofertas de Amazon con descuentos considerables. El negocio se basa en el **programa de afiliados de Amazon**: cada vez que alguien compra a través de tu enlace, recibes una comisión de entre el 1% y el 10% según la categoría del producto.

Formato de cada publicación:
- Categoría con hashtag (`#Electrónica`, `#Moda`...)
- Nombre del producto
- Precio original ❌ y precio actual ✅
- Enlace de Amazon con tu tag de afiliado (`?tag=TU-TAG`)
- Aviso legal obligatorio: *"En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas"*

---

## Stack técnico

| Pieza             | Opción recomendada                | Coste    |
| ----------------- | --------------------------------- | -------- |
| Lenguaje          | NestJS (ya tienes trabajo hecho)  | Gratis   |
| Fuente de ofertas | Keepa API                         | ~17€/mes |
| Envío a Telegram  | API oficial de Telegram (Bot API) | Gratis   |
| Scheduler         | Cron job o NestJS TaskScheduler   | Gratis   |
| Servidor          | VPS básico                        | ~4€/mes  |

---

## Amazon PA API — Lo que necesitas saber

La **Product Advertising API (PA API 5.0)** de Amazon es la fuente oficial de datos de productos, pero tiene un requisito:

- Necesitas **3 ventas cualificadas en 180 días** desde que te aprueban como afiliado.
- Sin esas ventas, cierran la cuenta y pierdes el acceso.
- El acceso a la API se solicita desde el panel de afiliados una vez cumplido el requisito.

### Keepa como alternativa inicial

Keepa es independiente de Amazon y no requiere ventas previas. Permite:
- Detectar bajadas de precio reales (con histórico)
- Ver ranking de ventas
- Configurar alertas de precio

**Limitación**: Keepa no da títulos ni imágenes completas de productos — para eso necesitarías la PA API o construir el enlace manualmente.

---

## Estrategia para los primeros meses (sin PA API)

1. Usar **Keepa** para detectar chollos
2. Construir el enlace con tu tag manualmente: `https://www.amazon.es/dp/ASIN/?tag=TU-TAG`
3. Publicar semi-automático hasta conseguir las 3 ventas
4. Solicitar PA API y automatizar todo

---

## Estudio de ingresos realista (año 1)

### Supuestos base
- Comisión media: 4% (varía entre 1–10% por categoría)
- Ticket medio de compra: 35€
- Tasa de conversión: 1–2% de suscriptores
- Ofertas por día: 3–5

### Proyección de suscriptores e ingresos

| Mes | Suscriptores est. | Ingresos est. |
| --- | ----------------- | ------------- |
| 1   | 50                | 0€            |
| 2   | 150               | 0€            |
| 3   | 300               | 2€            |
| 4   | 500               | 5€            |
| 5   | 750               | 12€           |
| 6   | 1.100             | 25€           |
| 7   | 1.500             | 45€           |
| 8   | 1.900             | 70€           |
| 9   | 2.300             | 100€          |
| 10  | 2.600             | 130€          |
| 11  | 2.900             | 160€          |
| 12  | 3.200             | 190€          |

### Tres escenarios al mes 12

| Escenario      | Suscriptores | Ingresos/mes |
| -------------- | ------------ | ------------ |
| Pesimista      | ~800         | 30–60€       |
| **Realista** ⭐ | ~2.500       | 120–200€     |
| Optimista      | 8.000+       | 400–700€     |

### Costes mensuales

| Concepto           | Coste        |
| ------------------ | ------------ |
| Keepa API          | ~17€/mes     |
| VPS                | ~4€/mes      |
| Dominio (opcional) | ~1€/mes      |
| **Total**          | **~22€/mes** |

> El **break-even** llega aproximadamente en el mes 6–7, cuando los ingresos cubren los costes de Keepa y servidor.

---

## Enfoque: generalista

Se ha decidido un enfoque **generalista** (todas las categorías), igual que el canal de referencia [ofertitas10](https://t.me/ofertitas10).

**Ventajas:**
- Creces más rápido en suscriptores
- Más variedad de ofertas disponibles
- Más fácil de automatizar

**Cómo compensar la comisión más baja:**
Mezclar electrónica (atrae suscriptores) con moda, belleza y juguetes (mejor comisión). Las categorías con mayor comisión en Amazon España son moda y productos propios de Amazon (8–10%).

---

## Plan de acción recomendado

```
Semana 1:  ✅ Registrarse en afiliados.amazon.es (GRATIS)
           ✅ Crear canal de Telegram (aunque esté vacío)
           ✅ Empezar desarrollo del bot en NestJS

Semanas 2-4: Desarrollar el bot
             Publicar primeras ofertas manualmente con tu tag
             para ir generando las 3 ventas necesarias

Mes 2-3:   Solicitar PA API (si ya tienes las 3 ventas)
           Lanzar bot automatizado
```

> ⚠️ **Importante**: El contador de 180 días empieza cuando te aprueban como afiliado, no cuando lanzas el bot. Cuanto antes te registres, antes empieza el plazo.

---

## Registro en Amazon Afiliados — qué necesitas

- Cuenta de Amazon normal
- Canal de Telegram ya creado (lo piden como plataforma de promoción)
- Breve descripción de cómo vas a promocionar (2-3 frases)
- Número de teléfono y datos fiscales

Enlace: [afiliados.amazon.es](https://afiliados.amazon.es)

---

## Conclusión

| Horizonte   | ¿Merece la pena?                           |
| ----------- | ------------------------------------------ |
| Año 1       | Proyecto hobby, ingresos modestos          |
| Año 2-3     | Canal consolidado, 500–1.500€/mes posibles |
| Largo plazo | Ingreso pasivo real una vez automatizado   |

El esfuerzo real se concentra en los primeros 2–3 meses de setup. Después, con la automatización funcionando, es prácticamente pasivo.