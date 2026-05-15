-- =============================================================================
-- SIGEL — Vistas analíticas
-- =============================================================================
SET search_path TO sigel, public;

-- Última puntuación por GAD
CREATE OR REPLACE VIEW vw_scoring_actual AS
SELECT DISTINCT ON (s.gad_id)
    s.gad_id,
    g.nombre        AS gad_nombre,
    g.tipo          AS gad_tipo,
    p.nombre        AS provincia,
    c.nombre        AS canton,
    s.fecha_corte,
    s.ingel,
    s.transparencia,
    s.finanzas,
    s.servicios,
    s.desarrollo,
    s.gestion_institucional,
    s.participacion,
    s.legitimidad,
    s.innovacion,
    s.iri,
    s.itd,
    s.icdl,
    s.nivel_desempeno,
    s.semaforo,
    s.ranking_nacional,
    s.ranking_provincial,
    s.ranking_cluster
FROM scoring s
JOIN gads g ON g.id = s.gad_id
LEFT JOIN provincias p ON p.id = g.provincia_id
LEFT JOIN cantones c ON c.id = g.canton_id
ORDER BY s.gad_id, s.fecha_corte DESC;

-- Ranking nacional
CREATE OR REPLACE VIEW vw_ranking_nacional AS
SELECT
    ROW_NUMBER() OVER (ORDER BY ingel DESC) AS posicion,
    gad_id,
    gad_nombre,
    gad_tipo,
    provincia,
    canton,
    ingel,
    nivel_desempeno,
    semaforo,
    fecha_corte
FROM vw_scoring_actual
WHERE ingel IS NOT NULL;

-- Ranking provincial (cada provincia ordenada)
CREATE OR REPLACE VIEW vw_ranking_provincial AS
SELECT
    provincia,
    ROW_NUMBER() OVER (PARTITION BY provincia ORDER BY ingel DESC) AS posicion_provincia,
    gad_id,
    gad_nombre,
    gad_tipo,
    canton,
    ingel,
    nivel_desempeno
FROM vw_scoring_actual
WHERE gad_tipo = 'MUNICIPAL' AND ingel IS NOT NULL;

-- Estadísticas nacionales
CREATE OR REPLACE VIEW vw_estadisticas_nacionales AS
SELECT
    COUNT(*)                                  AS total_gads,
    COUNT(*) FILTER (WHERE gad_tipo = 'MUNICIPAL') AS total_municipales,
    COUNT(*) FILTER (WHERE gad_tipo = 'PROVINCIAL') AS total_provinciales,
    ROUND(AVG(ingel)::numeric, 2)             AS promedio_ingel,
    ROUND(MIN(ingel)::numeric, 2)             AS min_ingel,
    ROUND(MAX(ingel)::numeric, 2)             AS max_ingel,
    ROUND(STDDEV(ingel)::numeric, 2)          AS std_ingel,
    COUNT(*) FILTER (WHERE semaforo = 'VERDE')    AS gads_verdes,
    COUNT(*) FILTER (WHERE semaforo = 'AMARILLO') AS gads_amarillos,
    COUNT(*) FILTER (WHERE semaforo = 'ROJO')     AS gads_rojos
FROM vw_scoring_actual;

-- Evolución histórica (serie temporal por GAD)
CREATE OR REPLACE VIEW vw_evolucion_historica AS
SELECT
    s.gad_id,
    g.nombre AS gad_nombre,
    s.fecha_corte,
    s.ingel,
    s.transparencia,
    s.finanzas,
    s.servicios,
    s.participacion,
    s.legitimidad,
    LAG(s.ingel) OVER (PARTITION BY s.gad_id ORDER BY s.fecha_corte) AS ingel_anterior,
    s.ingel - LAG(s.ingel) OVER (PARTITION BY s.gad_id ORDER BY s.fecha_corte) AS variacion
FROM scoring s
JOIN gads g ON g.id = s.gad_id
ORDER BY s.gad_id, s.fecha_corte;

-- Alertas activas con contexto
CREATE OR REPLACE VIEW vw_alertas_activas AS
SELECT
    a.id,
    a.uuid,
    a.tipo,
    a.nivel,
    a.titulo,
    a.descripcion,
    a.fecha,
    g.nombre        AS gad_nombre,
    g.tipo          AS gad_tipo,
    p.nombre        AS provincia,
    c.nombre        AS canton,
    i.nombre        AS indicador,
    a.valor_observado,
    a.umbral,
    a.detectado_por
FROM alertas a
LEFT JOIN gads g ON g.id = a.gad_id
LEFT JOIN provincias p ON p.id = g.provincia_id
LEFT JOIN cantones c ON c.id = g.canton_id
LEFT JOIN indicadores i ON i.id = a.indicador_id
WHERE a.estado = 'ACTIVA'
ORDER BY
    CASE a.nivel WHEN 'CRITICO' THEN 1 WHEN 'ALTO' THEN 2 WHEN 'MEDIO' THEN 3 ELSE 4 END,
    a.fecha DESC;

-- Indicadores de percepción ciudadana agregados
CREATE OR REPLACE VIEW vw_percepcion_ciudadana AS
SELECT
    r.gad_id,
    g.nombre AS gad_nombre,
    COUNT(*) AS total_respuestas,
    ROUND(AVG(r.confianza)::numeric, 2)     AS confianza_promedio,
    ROUND(AVG(r.transparencia)::numeric, 2) AS transparencia_promedio,
    ROUND(AVG(r.satisfaccion)::numeric, 2)  AS satisfaccion_promedio,
    ROUND(AVG(r.participacion)::numeric, 2) AS participacion_promedio,
    ROUND(AVG(r.corrupcion)::numeric, 2)    AS corrupcion_promedio,
    ROUND(AVG(r.servicios)::numeric, 2)     AS servicios_promedio
FROM respuestas_ciudadanas r
JOIN gads g ON g.id = r.gad_id
WHERE r.fecha >= NOW() - INTERVAL '6 months'
GROUP BY r.gad_id, g.nombre;

-- Mapa de calor: scoring agregado por provincia
CREATE OR REPLACE VIEW vw_mapa_provincial AS
SELECT
    p.id,
    p.nombre,
    p.centroide,
    p.geometria,
    COUNT(s.gad_id) AS gads_evaluados,
    ROUND(AVG(s.ingel)::numeric, 2) AS ingel_promedio,
    ROUND(AVG(s.transparencia)::numeric, 2) AS transparencia_promedio,
    ROUND(AVG(s.servicios)::numeric, 2) AS servicios_promedio
FROM provincias p
LEFT JOIN gads g ON g.provincia_id = p.id
LEFT JOIN vw_scoring_actual s ON s.gad_id = g.id
GROUP BY p.id, p.nombre, p.centroide, p.geometria;
