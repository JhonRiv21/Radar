-- Restos de la etapa GDELT (tablero de noticias), ya sin uso en el código:
--   * radar.events           -> tabla completa del modelo de noticias
--   * hazards.coverage_count -> "cuántas noticias cubren esta amenaza"
--   * hazards.coverage_checked_at
--
-- ANTES DE APLICAR: revisar si la tabla todavía guarda historia que quieras conservar.
--   select count(*), min(ingested_at), max(ingested_at) from radar.events;
--
-- Es destructivo e irreversible. Aplicar solo tras esa comprobación.

drop table if exists radar.events;

alter table radar.hazards
  drop column if exists coverage_count,
  drop column if exists coverage_checked_at;
