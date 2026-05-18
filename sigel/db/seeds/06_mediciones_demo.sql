-- =============================================================================
-- SIGEL — Seed 06: mediciones de demostración
-- =============================================================================
-- Resuelve el gap funcional: sin filas en `mediciones`, el motor de scoring
-- (analytics.scoring_engine.calcular_score_gad) produce INGEL vacío hasta que
-- el scraper/ETL inyecte datos reales.
--
-- Este seed genera mediciones DETERMINISTAS (reproducibles) para cada
-- combinación GAD × indicador, en 3 cortes anuales (2023, 2024, 2025) para
-- alimentar también la vista de evolución histórica.
--
-- El valor se deriva de un hash md5(gad_id, indicador_id, año) escalado al
-- rango [valor_min, valor_max] del indicador, con:
--   - un sesgo por GAD (algunos GADs rinden mejor de forma consistente)
--   - una leve tendencia ascendente año a año (mejora continua simulada)
--
-- NO usa random() para que cada `psql -f` produzca el mismo dataset.
-- En producción, estas filas las reemplaza el pipeline real (LOTAIP/SERCOP/MEF).
-- =============================================================================
SET search_path TO sigel, public;

-- Limpia mediciones de demo previas (idempotencia)
DELETE FROM sigel.mediciones WHERE fuente = 'SEED_DEMO';

INSERT INTO sigel.mediciones
    (indicador_id, gad_id, valor, fecha, periodo, fuente, metodo_recoleccion, confiabilidad)
SELECT
    i.id  AS indicador_id,
    g.id  AS gad_id,
    -- valor = min + frac * (max - min), acotado al rango del indicador
    ROUND(
      LEAST(i.valor_max, GREATEST(i.valor_min,
        i.valor_min
        + (
            -- fracción base [0,1] determinista por (gad, indicador, año),
            -- comprimida hacia el centro-alto (0.30..0.95) para un espectro
            -- realista (mezcla de VERDE/AMARILLO/ROJO, no todo crítico)
            0.30 + 0.65 * (('x' || substr(md5(g.id::text || ':' || i.id::text || ':' || yr.anio::text), 1, 8))::bit(32)::bigint
              & 2147483647)::numeric / 2147483647.0
            -- sesgo por GAD: ±0.18 estable por entidad (separa líderes y rezagados)
            + ((('x' || substr(md5(g.id::text || ':bias'), 1, 8))::bit(32)::bigint & 2147483647)::numeric / 2147483647.0 - 0.5) * 0.36
            -- tendencia ascendente: +0.035 por año desde 2023 (mejora continua)
            + (yr.anio - 2023) * 0.035
          )
          -- escala al rango del indicador (clamp posterior asegura límites)
          * (i.valor_max - i.valor_min)
      ))::numeric
    , 4) AS valor,
    make_date(yr.anio, 6, 1)                         AS fecha,
    yr.anio::text || '-S1'                            AS periodo,
    'SEED_DEMO'                                       AS fuente,
    'MANUAL'                                          AS metodo_recoleccion,
    0.70                                              AS confiabilidad
FROM sigel.gads g
CROSS JOIN sigel.indicadores i
CROSS JOIN (VALUES (2023), (2024), (2025)) AS yr(anio)
WHERE g.activo = TRUE
  AND i.activo = TRUE
  -- aplica solo indicadores pertinentes al tipo de GAD
  AND (
        (g.tipo = 'MUNICIPAL'  AND i.aplica_municipal  = TRUE)
     OR (g.tipo = 'PROVINCIAL' AND i.aplica_provincial = TRUE)
  );

-- Reporte de carga
DO $$
DECLARE
  n_med   bigint;
  n_gad   bigint;
BEGIN
  SELECT COUNT(*) INTO n_med FROM sigel.mediciones WHERE fuente = 'SEED_DEMO';
  SELECT COUNT(DISTINCT gad_id) INTO n_gad FROM sigel.mediciones WHERE fuente = 'SEED_DEMO';
  RAISE NOTICE 'Seed mediciones demo: % filas para % GADs (3 cortes anuales).', n_med, n_gad;
END $$;

-- =============================================================================
-- Recálculo del scoring para todos los GADs a partir de las mediciones recién
-- cargadas. Replica la lógica del motor Python (scoring_engine.py) en SQL puro
-- para que el seed sea autosuficiente (no requiere levantar analytics).
-- Ponderaciones idénticas a config.py / ingel.js / 0003_scoring_functions.sql.
-- =============================================================================
DO $$
DECLARE
  rec RECORD;
  v_t numeric; v_f numeric; v_s numeric; v_d numeric;
  v_g numeric; v_p numeric; v_l numeric; v_i numeric;
  v_ingel numeric;
  v_anio  int;
BEGIN
  FOR v_anio IN SELECT unnest(ARRAY[2023,2024,2025]) LOOP
    FOR rec IN SELECT id FROM sigel.gads WHERE activo = TRUE LOOP
      -- Promedio normalizado (0-100) por dimensión, según tipo de indicador
      SELECT
        COALESCE(AVG(CASE WHEN d.codigo='TRANS' THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='FIN'   THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='SERV'  THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='DESA'  THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='GEST'  THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='PART'  THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='LEGIT' THEN nv END),0),
        COALESCE(AVG(CASE WHEN d.codigo='INNOV' THEN nv END),0)
      INTO v_t, v_f, v_s, v_d, v_g, v_p, v_l, v_i
      FROM sigel.mediciones m
      JOIN sigel.indicadores i ON i.id = m.indicador_id
      JOIN sigel.variables   vr ON vr.id = i.variable_id
      JOIN sigel.dimensiones d ON d.id = vr.dimension_id
      CROSS JOIN LATERAL (
        SELECT CASE
          WHEN i.tipo = 'POSITIVO'
            THEN normalizar_positivo(m.valor, i.valor_min, i.valor_max) * 100
          WHEN i.tipo = 'NEGATIVO'
            THEN normalizar_negativo(m.valor, i.valor_min, i.valor_max) * 100
          ELSE 0 END AS nv
      ) calc
      WHERE m.gad_id = rec.id
        AND m.fuente = 'SEED_DEMO'
        AND EXTRACT(YEAR FROM m.fecha) = v_anio;

      v_ingel := calcular_ingel(v_t, v_f, v_s, v_d, v_g, v_p, v_l, v_i);

      INSERT INTO sigel.scoring
        (gad_id, fecha_corte, ingel, transparencia, finanzas, servicios,
         desarrollo, gestion_institucional, participacion, legitimidad,
         innovacion, iri, itd, icdl,
         componente_objetivo, componente_ciudadano, componente_experto,
         version_algoritmo)
      VALUES
        (rec.id, make_date(v_anio, 6, 1), v_ingel,
         ROUND(v_t,3), ROUND(v_f,3), ROUND(v_s,3), ROUND(v_d,3),
         ROUND(v_g,3), ROUND(v_p,3), ROUND(v_l,3), ROUND(v_i,3),
         ROUND(GREATEST(0, LEAST(100,
            (100-v_t)*0.25 + (100-v_f)*0.20 + (100-v_f)*0.20
            + (100-v_l)*0.20 + (100-v_p)*0.15))::numeric, 3),
         ROUND(((v_t + v_i) / 2)::numeric, 3),
         ROUND(((v_l + v_p + v_t) / 3)::numeric, 3),
         v_ingel, v_ingel, v_ingel, '1.0.0-seed')
      ON CONFLICT (gad_id, fecha_corte) DO UPDATE SET
        ingel = EXCLUDED.ingel,
        transparencia = EXCLUDED.transparencia,
        finanzas = EXCLUDED.finanzas,
        servicios = EXCLUDED.servicios,
        desarrollo = EXCLUDED.desarrollo,
        gestion_institucional = EXCLUDED.gestion_institucional,
        participacion = EXCLUDED.participacion,
        legitimidad = EXCLUDED.legitimidad,
        innovacion = EXCLUDED.innovacion,
        iri = EXCLUDED.iri, itd = EXCLUDED.itd, icdl = EXCLUDED.icdl,
        version_algoritmo = EXCLUDED.version_algoritmo;
    END LOOP;
  END LOOP;

  -- Ranking nacional para el corte vigente (2025)
  PERFORM recalcular_ranking_nacional(make_date(2025, 6, 1));
  RAISE NOTICE 'Scoring demo recalculado para 3 cortes anuales + ranking 2025.';
END $$;
