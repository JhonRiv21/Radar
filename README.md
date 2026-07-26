# radar

Tablero **en vivo** de noticias y eventos del mundo, geolocalizados. Se alimenta y
actualiza solo desde [GDELT](https://www.gdeltproject.org/) — sin intervención manual.

> Pieza de portafolio. Un motor reutilizable de centralización de datos públicos:
> `ingesta (cron) → normaliza → Postgres → API → UI en vivo`.

## Por qué está construido así

- **Motor agnóstico de fuente.** Cambiar de GDELT a otra fuente = cambiar solo el adaptador de ingesta.
- **Guarda su propio snapshot.** Si la fuente se cae, la UI sigue mostrando el último estado (degradación elegante). Un demo en vivo nunca se ve roto.
- **Retención acotada, con freno de seguridad.** Purga eventos de más de 30 días, pero **solo si entraron datos en las últimas 24h**: si la ingesta se rompe, prefiere historia vieja antes que una base vacía.
- **Ingesta desacoplada del trigger.** `runIngest()` la dispara una ruta cron protegida: Vercel Cron hoy, cron del sistema en Hetzner mañana. Mismo código.
- **Portable de raíz.** Postgres por connection string (nada de SDKs propietarios) + `output: standalone`
- **Costo de IA: $0.** La "inteligencia" (clustering, tendencias, clasificación) se hace con estadística y NLP clásico, en el mismo servidor.

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind v4 · Drizzle ORM ·
Postgres (Supabase, session pooler) · MapLibre.

## Roadmap

- [x] **Fase 0** — Esqueleto: ingesta GDELT → Postgres → feed en pantalla.
- [x] **Fase 1** — Mapa (MapLibre) con actividad por país (GDELT GEO API caída → centroides por país; swappable a nivel ciudad cuando vuelva).
- [x] **Fase 2** — Ingesta automática (GitHub Actions cada 30 min) + auto-refresh de UI (60s) + estados fresco/desactualizado/error + `/api/health`.
                                                                    - [x] **Fase 3** — Inteligencia sin LLM: clustering por solapamiento de tokens (Jaccard), tendencias "En alza" (frecuencia 24h vs. baseline diario, en SQL), clasificación por reglas y tabla con scroll infinito.
- [ ] **Fase 4** — Filtros, detalle de clúster, KPIs, pulido de UI.
- [ ] **Fase 5** — Vitrina: diagrama, deploy en vivo.

### Pendiente (requiere servidor propio)

- **Traducción de titulares ES/EN.** Con un modelo auto-hospedado sale a costo marginal cero; vía API de pago costaría ~$15-20/mes, que no se justifica en un portafolio.
