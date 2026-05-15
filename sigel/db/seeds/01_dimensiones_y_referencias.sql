-- =============================================================================
-- SIGEL — Seed 01: Regiones, Dimensiones, Variables, Indicadores, Partidos, Roles
-- =============================================================================
SET search_path TO sigel, public;

-- ---------- Regiones ----------
INSERT INTO regiones (codigo, nombre, descripcion) VALUES
    ('COSTA',     'Costa',     'Región litoral del Pacífico'),
    ('SIERRA',    'Sierra',    'Región andina interior'),
    ('AMAZONIA',  'Amazonía',  'Región oriental amazónica'),
    ('INSULAR',   'Insular',   'Región Galápagos');

-- ---------- Roles ----------
INSERT INTO roles (codigo, nombre, descripcion, permisos) VALUES
    ('CIUDADANO',     'Ciudadano',      'Acceso público — consulta',          '["read:public"]'::jsonb),
    ('OBSERVADOR',    'Observador',     'Acceso lectura completa + auditoría','["read:*","read:audit"]'::jsonb),
    ('ANALISTA',      'Analista',       'Carga de mediciones y revisiones',    '["read:*","write:mediciones","write:scoring"]'::jsonb),
    ('INVESTIGADOR',  'Investigador',   'Exportación de datasets',             '["read:*","export:datasets"]'::jsonb),
    ('ADMIN',         'Administrador',  'Acceso total',                        '["*"]'::jsonb);

-- ---------- Dimensiones SIGEL (8 con ponderaciones del modelo metodológico) ----------
INSERT INTO dimensiones (codigo, nombre, descripcion, ponderacion, color_hex, icono, orden) VALUES
    ('TRANS', 'Transparencia y acceso a información pública', 'LOTAIP, Infoparticipa, Gobierno Abierto', 20.00, '#0F766E', 'shield-check', 1),
    ('FIN',   'Gestión financiera y administrativa',          'Ejecución presupuestaria, sostenibilidad fiscal', 15.00, '#1E40AF', 'banknote', 2),
    ('SERV',  'Calidad de servicios públicos',                 'Cobertura agua, basura, movilidad, vialidad rural', 20.00, '#9333EA', 'sparkles', 3),
    ('DESA',  'Desarrollo territorial sostenible',             'Económico, social, ambiental, ordenamiento (ISO 18091)', 10.00, '#16A34A', 'globe', 4),
    ('GEST',  'Gestión institucional y talento humano',        'Evaluación desempeño, capacitación, profesionalización', 10.00, '#EA580C', 'users', 5),
    ('PART',  'Participación ciudadana',                       'Cabildos, presupuesto participativo, veedurías', 10.00, '#DC2626', 'megaphone', 6),
    ('LEGIT', 'Legitimidad y confianza pública',               'Confianza, satisfacción, percepción corrupción', 10.00, '#7C3AED', 'badge-check', 7),
    ('INNOV', 'Innovación y gobierno digital',                 'Trámites virtuales, interoperabilidad, IA', 5.00, '#0891B2', 'cpu', 8);

-- ---------- Variables (por dimensión) ----------
-- Transparencia
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='TRANS'), 'TR_INFO',  'Información pública',  30.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='TRANS'), 'TR_RC',    'Rendición de cuentas', 25.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='TRANS'), 'TR_DA',    'Datos abiertos',       20.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='TRANS'), 'TR_ACC',   'Accesibilidad',        15.00, 4),
    ((SELECT id FROM dimensiones WHERE codigo='TRANS'), 'TR_ACT',   'Actualización',        10.00, 5);

-- Finanzas
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='FIN'), 'FN_EJEC',   'Ejecución presupuestaria', 30.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='FIN'), 'FN_SOST',   'Sostenibilidad fiscal',     25.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='FIN'), 'FN_EFIC',   'Eficiencia administrativa', 20.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='FIN'), 'FN_INV',    'Inversión pública',          15.00, 4),
    ((SELECT id FROM dimensiones WHERE codigo='FIN'), 'FN_REC',    'Recaudación',                10.00, 5);

-- Servicios
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='SERV'), 'SV_AGUA',   'Agua potable',         25.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='SERV'), 'SV_BASURA', 'Recolección basura',   20.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='SERV'), 'SV_VIAL',   'Vialidad/Movilidad',   20.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='SERV'), 'SV_ATEN',   'Atención ciudadana',   15.00, 4),
    ((SELECT id FROM dimensiones WHERE codigo='SERV'), 'SV_DIG',    'Digitalización',       10.00, 5),
    ((SELECT id FROM dimensiones WHERE codigo='SERV'), 'SV_AMB',    'Gestión ambiental',    10.00, 6);

-- Desarrollo
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='DESA'), 'DS_ECON', 'Desarrollo económico',  30.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='DESA'), 'DS_SOC',  'Desarrollo social',     30.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='DESA'), 'DS_AMB',  'Desarrollo ambiental',  20.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='DESA'), 'DS_OT',   'Ordenamiento territorial', 20.00, 4);

-- Gestión Institucional
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='GEST'), 'GI_EVAL',  'Evaluación desempeño',   25.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='GEST'), 'GI_CAP',   'Capacitación',           20.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='GEST'), 'GI_PROF',  'Profesionalización',     20.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='GEST'), 'GI_INNOV', 'Innovación interna',     20.00, 4),
    ((SELECT id FROM dimensiones WHERE codigo='GEST'), 'GI_CLIM',  'Clima organizacional',   15.00, 5);

-- Participación
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='PART'), 'PC_MEC',   'Mecanismos de participación', 30.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='PART'), 'PC_INCL',  'Inclusión',                    25.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='PART'), 'PC_CTRL',  'Control social/veedurías',     25.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='PART'), 'PC_GOB',   'Gobernanza interactiva',       20.00, 4);

-- Legitimidad
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='LEGIT'), 'LG_CONF',  'Confianza institucional', 30.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='LEGIT'), 'LG_IMG',   'Imagen institucional',    25.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='LEGIT'), 'LG_CORR',  'Percepción corrupción',   25.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='LEGIT'), 'LG_SAT',   'Satisfacción calidad',    20.00, 4);

-- Innovación
INSERT INTO variables (dimension_id, codigo, nombre, peso, orden) VALUES
    ((SELECT id FROM dimensiones WHERE codigo='INNOV'), 'IN_APP',  'App institucional',      20.00, 1),
    ((SELECT id FROM dimensiones WHERE codigo='INNOV'), 'IN_TRAM', 'Trámites virtuales',     25.00, 2),
    ((SELECT id FROM dimensiones WHERE codigo='INNOV'), 'IN_DAT',  'Inteligencia de datos',  20.00, 3),
    ((SELECT id FROM dimensiones WHERE codigo='INNOV'), 'IN_INTE', 'Interoperabilidad',      15.00, 4),
    ((SELECT id FROM dimensiones WHERE codigo='INNOV'), 'IN_SD',   'Servicios digitales',    20.00, 5);

-- ---------- Indicadores (subset crítico — el catálogo completo se carga por ETL) ----------
INSERT INTO indicadores (variable_id, codigo, nombre, tipo, unidad, peso, valor_min, valor_max, frecuencia, fuente) VALUES
    ((SELECT id FROM variables WHERE codigo='TR_INFO'),  'IND_TR_LOTAIP',     'Cumplimiento LOTAIP', 'POSITIVO', '%', 25, 0, 100, 'MENSUAL', 'CPCCS'),
    ((SELECT id FROM variables WHERE codigo='TR_INFO'),  'IND_TR_PRESUP',     'Publicación presupuesto', 'POSITIVO', 'BOOL', 20, 0, 1, 'TRIMESTRAL', 'Ministerio Finanzas'),
    ((SELECT id FROM variables WHERE codigo='TR_INFO'),  'IND_TR_CONTRAT',    'Contratación pública visible', 'POSITIVO', 'BOOL', 20, 0, 1, 'TRIMESTRAL', 'SERCOP'),
    ((SELECT id FROM variables WHERE codigo='TR_RC'),    'IND_TR_INFORME',    'Informes de gestión publicados', 'POSITIVO', 'NUM', 30, 0, 12, 'ANUAL', 'CPCCS'),
    ((SELECT id FROM variables WHERE codigo='TR_DA'),    'IND_TR_DATOS',      'Datasets abiertos publicados', 'POSITIVO', 'NUM', 25, 0, 100, 'TRIMESTRAL', 'Portal Datos Abiertos'),
    ((SELECT id FROM variables WHERE codigo='FN_EJEC'),  'IND_FN_PCEJEC',     '% ejecución presupuestaria', 'POSITIVO', '%', 35, 0, 100, 'TRIMESTRAL', 'Ministerio Finanzas'),
    ((SELECT id FROM variables WHERE codigo='FN_SOST'),  'IND_FN_DEUDA',      'Nivel de endeudamiento', 'NEGATIVO', '%', 25, 0, 200, 'TRIMESTRAL', 'Ministerio Finanzas'),
    ((SELECT id FROM variables WHERE codigo='FN_INV'),   'IND_FN_INVSOC',     '% inversión social', 'POSITIVO', '%', 20, 0, 100, 'ANUAL', 'Ministerio Finanzas'),
    ((SELECT id FROM variables WHERE codigo='SV_AGUA'),  'IND_SV_COBAGUA',    'Cobertura agua potable', 'POSITIVO', '%', 40, 0, 100, 'ANUAL', 'INEC'),
    ((SELECT id FROM variables WHERE codigo='SV_BASURA'),'IND_SV_BASURA',     'Frecuencia recolección basura', 'POSITIVO', 'veces/sem', 30, 0, 7, 'TRIMESTRAL', 'GAD'),
    ((SELECT id FROM variables WHERE codigo='SV_VIAL'),  'IND_SV_VIAL',       'Estado vialidad rural', 'POSITIVO', '%', 30, 0, 100, 'SEMESTRAL', 'GAD provincial'),
    ((SELECT id FROM variables WHERE codigo='PC_MEC'),   'IND_PC_CABILDO',    'Cabildos abiertos realizados', 'POSITIVO', 'NUM', 30, 0, 24, 'ANUAL', 'GAD'),
    ((SELECT id FROM variables WHERE codigo='PC_CTRL'),  'IND_PC_VEED',       'Veedurías activas', 'POSITIVO', 'NUM', 25, 0, 50, 'ANUAL', 'CPCCS'),
    ((SELECT id FROM variables WHERE codigo='LG_CONF'),  'IND_LG_CONF',       'Confianza ciudadana (encuesta)', 'POSITIVO', 'Likert', 30, 1, 5, 'SEMESTRAL', 'Encuesta SIGEL'),
    ((SELECT id FROM variables WHERE codigo='LG_CORR'),  'IND_LG_CORR',       'Percepción de corrupción', 'NEGATIVO', 'Likert', 25, 1, 5, 'SEMESTRAL', 'Encuesta SIGEL'),
    ((SELECT id FROM variables WHERE codigo='IN_TRAM'),  'IND_IN_TRAM',       'Trámites en línea disponibles', 'POSITIVO', 'NUM', 30, 0, 50, 'TRIMESTRAL', 'GAD');

-- ---------- Partidos políticos (extraídos del seed electoral) ----------
INSERT INTO partidos_politicos (nombre, nombre_corto, ideologia) VALUES
    ('Revolución Ciudadana',                          'RC',          'Progresismo / Socialismo del Siglo XXI'),
    ('Movimiento de Unidad Plurinacional Pachakutik', 'PK',          'Plurinacionalismo / Izquierda indigenista'),
    ('Movimiento Construye',                          'Construye',   'Centro'),
    ('Partido Social Cristiano',                      'PSC',         'Derecha conservadora'),
    ('Acción Democrática Nacional',                   'ADN',         'Centro-derecha'),
    ('Izquierda Democrática',                         'ID',          'Socialdemocracia'),
    ('SUMA',                                          'SUMA',        'Centro-derecha'),
    ('Partido Socialista Ecuatoriano',                'PSE',         'Socialismo democrático'),
    ('Avanza',                                        'AVANZA',      'Centro'),
    ('Democracia Sí',                                 'DSi',         'Centro'),
    ('Unidad Popular',                                'UP',          'Izquierda'),
    ('Movimiento Igualdad',                           'IGUALDAD',    'Progresismo'),
    ('Partido Movimiento Todos Unidos',               'TUNIDOS',     'Centro'),
    ('Centro Democrático',                            'CD',          'Centro'),
    ('CREO',                                          'CREO',        'Centro-derecha'),
    ('Independiente',                                 'IND',         'Sin filiación');

