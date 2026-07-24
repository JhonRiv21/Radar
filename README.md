# radar

Tablero **en vivo** de noticias y eventos del mundo, geolocalizados. Se alimenta y
actualiza solo desde [GDELT](https://www.gdeltproject.org/) — sin intervención manual.

> Pieza de portafolio. Un motor reutilizable de centralización de datos públicos:
> `ingesta (cron) → normaliza → Postgres → API → UI en vivo`.

## Por qué está construido así

- **Motor agnóstico de fuente.** Cambiar de GDELT a otra fuente = cambiar solo el adaptador de ingesta.
- **Guarda su propio snapshot.** Si la fuente se cae, la UI sigue mostrando el último estado (degradación elegante). Un demo en vivo nunca se ve roto.
- **Ingesta desacoplada del trigger.** `runIngest()` la dispara una ruta cron protegida: Vercel Cron hoy, cron del sistema en Hetzner mañana. Mismo código.
- **Portable de raíz.** Postgres por connection string (nada de SDKs propietarios) + `output: standalone`
- **Costo de IA: $0.** La "inteligencia" (clustering, tendencias, clasificación) se hace con estadística y NLP clásico, en el mismo servidor.

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind v4 · Drizzle ORM ·
Postgres (Supabase, transaction pooler) · MapLibre *(próximas fases)*.

## Roadmap

- [x] **Fase 0** — Esqueleto: ingesta GDELT → Postgres → feed en pantalla.
- [ ] **Fase 1** — Mapa (MapLibre) con eventos geolocalizados.
- [ ] **Fase 2** — Auto-actualización + indicador de frescura + salud del pipeline.
- [ ] **Fase 3** — Inteligencia: clustering + tendencias ("en alza") + clasificación.
- [ ] **Fase 4** — Filtros, detalle de clúster, KPIs, pulido de UI.
- [ ] **Fase 5** — Vitrina: diagrama, deploy en vivo.
