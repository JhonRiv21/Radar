-- Defensa en profundidad (auditoría 2026-08-02, VULN-03).
--
-- Hoy el schema radar es inalcanzable para anon/authenticated: no tienen USAGE
-- sobre el schema ni un solo grant sobre las tablas, y radar no está publicado
-- en PostgREST. La app entra con su propio rol, al que RLS no le aplica.
--
-- El riesgo es futuro: un GRANT accidental o publicar el schema en pgrst.db_schemas
-- dejaría las tres tablas abiertas sin ninguna segunda barrera. Habilitar RLS sin
-- policies hace que el estado por defecto sea denegar.
--
-- NO APLICADA. Revisar y ejecutar contra el session pooler (DIRECT_URL).

ALTER TABLE radar.hazards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar.ingest_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar.events       ENABLE ROW LEVEL SECURITY;

-- Refuerzo explícito: aunque hoy no existan, ningún grant residual sobrevive.
REVOKE ALL ON ALL TABLES IN SCHEMA radar FROM anon, authenticated;
REVOKE ALL ON SCHEMA radar FROM anon, authenticated;
