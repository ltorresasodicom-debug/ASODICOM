-- =============================================================================
-- SIGEL — Seed 05: Fuentes de datos externas para ETL/scraping
-- =============================================================================
SET search_path TO sigel, public;

INSERT INTO fuentes_datos (codigo, nombre, tipo, url_base, descripcion, activa) VALUES
    ('SERCOP',         'SERCOP — Sistema Oficial de Contratación Pública',         'API',      'https://datosabiertos.compraspublicas.gob.ec/',
     'Datos abiertos de contratación pública del Ecuador. Fuente para indicador IND_TR_CONTRAT.', TRUE),
    ('MEF',            'Ministerio de Economía y Finanzas',                          'API',      'https://www.finanzas.gob.ec/datos-abiertos/',
     'Ejecución presupuestaria, transferencias, endeudamiento. Fuente para dimensión FIN.', TRUE),
    ('INEC',           'INEC — Instituto Nacional de Estadísticas y Censos',         'CSV',      'https://www.ecuadorencifras.gob.ec/',
     'Datos demográficos, pobreza, cobertura servicios. Fuente para dimensiones SERV, DESA.', TRUE),
    ('CPCCS',          'CPCCS — Consejo de Participación Ciudadana',                 'SCRAPING', 'https://www.cpccs.gob.ec/',
     'Rendición de cuentas, veedurías, control social. Fuente para dimensión TRANS, PART.', TRUE),
    ('CONTRALORIA',    'Contraloría General del Estado',                              'SCRAPING', 'https://www.contraloria.gob.ec/',
     'Auditorías, glosas, informes especiales. Insumo para alertas y riesgo institucional.', TRUE),
    ('LOTAIP_GAD',     'Portales LOTAIP de GADs municipales y provinciales',          'SCRAPING', '',
     'Crawler de portales de transparencia GAD. Indicador IND_TR_LOTAIP.', TRUE),
    ('GEOPORTAL_IGM',  'GeoPortal IGM — Instituto Geográfico Militar',               'API',      'https://www.geoportaligm.gob.ec/',
     'Capas geográficas oficiales (límites provinciales, cantonales, parroquiales).', TRUE);
