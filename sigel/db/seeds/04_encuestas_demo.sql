-- =============================================================================
-- SIGEL — Seed 04: Encuesta ciudadana base + preguntas (modelo metodológico)
-- =============================================================================
SET search_path TO sigel, public;

INSERT INTO encuestas (nombre, descripcion, tipo, fecha_inicio, fecha_fin, activa) VALUES
    ('Encuesta Nacional de Percepción Ciudadana SIGEL 2025',
     'Evaluación ciudadana de la gestión de alcaldes y prefectos del Ecuador',
     'PERCEPCION', '2025-01-01', '2025-12-31', TRUE);

WITH e AS (SELECT id FROM encuestas WHERE nombre = 'Encuesta Nacional de Percepción Ciudadana SIGEL 2025')
INSERT INTO preguntas_encuesta (encuesta_id, codigo, bloque, pregunta, tipo_respuesta, obligatoria, orden)
SELECT e.id, codigo, bloque, pregunta, tipo, obl, orden
FROM e, (VALUES
    -- Bloque 1: Información general (NO obligatorias, anonimato preservado)
    ('B1_PROV',   'INFO_GENERAL', 'Provincia donde reside',                                  'MULTIPLE',  TRUE, 1),
    ('B1_CANT',   'INFO_GENERAL', 'Cantón donde reside',                                     'MULTIPLE',  TRUE, 2),
    ('B1_EDAD',   'INFO_GENERAL', 'Rango de edad',                                            'MULTIPLE',  FALSE, 3),
    ('B1_SEXO',   'INFO_GENERAL', 'Sexo',                                                     'MULTIPLE',  FALSE, 4),
    ('B1_EDUC',   'INFO_GENERAL', 'Nivel educativo',                                          'MULTIPLE',  FALSE, 5),
    ('B1_ZONA',   'INFO_GENERAL', 'Zona de residencia (urbana/rural)',                        'MULTIPLE',  FALSE, 6),
    -- Bloque 2: Confianza institucional
    ('B2_CONF',   'CONFIANZA',    '¿Confía usted en la gestión de su alcalde/prefecto?',     'LIKERT_5',  TRUE, 7),
    ('B2_TRANS',  'CONFIANZA',    '¿Considera transparente la gestión de su autoridad?',     'LIKERT_5',  TRUE, 8),
    ('B2_CORR',   'CONFIANZA',    '¿Percibe corrupción en la administración local?',         'LIKERT_5',  TRUE, 9),
    -- Bloque 3: Calidad servicios
    ('B3_AGUA',   'SERVICIOS',    '¿Cómo evalúa el servicio de agua potable?',                'LIKERT_5',  TRUE, 10),
    ('B3_BAS',    'SERVICIOS',    '¿Cómo evalúa la recolección de basura?',                  'LIKERT_5',  TRUE, 11),
    ('B3_VIAL',   'SERVICIOS',    '¿Cómo evalúa el estado de las vías?',                     'LIKERT_5',  TRUE, 12),
    ('B3_ATEN',   'SERVICIOS',    '¿Cómo evalúa la atención ciudadana del GAD?',             'LIKERT_5',  TRUE, 13),
    -- Bloque 4: Participación
    ('B4_CAB',    'PARTICIPACION','¿Ha participado en cabildos o asambleas locales?',         'SI_NO',     TRUE, 14),
    ('B4_MEC',    'PARTICIPACION','¿Conoce los mecanismos de participación ciudadana?',       'LIKERT_5',  TRUE, 15),
    ('B4_OPN',    'PARTICIPACION','¿Siente que su opinión cuenta en las decisiones locales?', 'LIKERT_5',  TRUE, 16),
    -- Bloque 5: Transparencia digital
    ('B5_WEB',    'DIGITAL',      '¿La información en la web del GAD es clara y accesible?', 'LIKERT_5',  TRUE, 17),
    ('B5_FIND',   'DIGITAL',      '¿Puede encontrar información oficial fácilmente?',         'LIKERT_5',  TRUE, 18),
    ('B5_USE',    'DIGITAL',      '¿Usa los servicios digitales del GAD?',                    'SI_NO',     TRUE, 19),
    -- Bloque 6: Evaluación general
    ('B6_GEN',    'GENERAL',      '¿Cómo evalúa GLOBALMENTE la gestión de su autoridad?',    'LIKERT_5',  TRUE, 20),
    ('B6_OBS',    'GENERAL',      'Observaciones, sugerencias o quejas (opcional)',           'ABIERTA',   FALSE, 21)
) AS p(codigo, bloque, pregunta, tipo, obl, orden);
