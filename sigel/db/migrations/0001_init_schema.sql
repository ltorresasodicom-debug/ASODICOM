-- =============================================================================
-- SIGEL — Sistema Integral de Gestión y Evaluación Local
-- Migración 0001: esquema inicial completo
-- =============================================================================
-- Estándar: PostgreSQL 15 + PostGIS 3.4
-- Convención: snake_case, UUID v4 para PK públicas, BIGSERIAL para FK internas
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS sigel;
SET search_path TO sigel, public;

-- =============================================================================
-- 1. ENTIDADES TERRITORIALES
-- =============================================================================

CREATE TABLE regiones (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE regiones IS 'Costa, Sierra, Amazonía, Insular';

CREATE TABLE provincias (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    codigo_ine      VARCHAR(10) UNIQUE,
    nombre          VARCHAR(100) NOT NULL,
    nombre_norm     VARCHAR(100) GENERATED ALWAYS AS (unaccent(lower(nombre))) STORED,
    region_id       BIGINT REFERENCES regiones(id),
    poblacion       INT,
    superficie_km2  NUMERIC(12, 2),
    capital         VARCHAR(100),
    geometria       GEOMETRY(MULTIPOLYGON, 4326),
    centroide       GEOMETRY(POINT, 4326),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provincias_geometria ON provincias USING GIST(geometria);
CREATE INDEX idx_provincias_nombre_trgm ON provincias USING GIN(nombre_norm gin_trgm_ops);

CREATE TABLE cantones (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    provincia_id    BIGINT NOT NULL REFERENCES provincias(id) ON DELETE RESTRICT,
    codigo_ine      VARCHAR(10) UNIQUE,
    nombre          VARCHAR(120) NOT NULL,
    nombre_norm     VARCHAR(120) GENERATED ALWAYS AS (unaccent(lower(nombre))) STORED,
    poblacion       INT,
    superficie_km2  NUMERIC(12, 2),
    densidad        NUMERIC(10, 2),
    presupuesto     NUMERIC(18, 2),
    -- Clasificación territorial (cluster K-Means)
    categoria       VARCHAR(30) CHECK (categoria IN
                       ('METROPOLITANO','INTERMEDIO','PEQUENO','RURAL_DISPERSO','AMAZONICO','TURISTICO','FRONTERIZO')),
    indice_pobreza  NUMERIC(5, 2),
    ruralidad_pct   NUMERIC(5, 2),
    geometria       GEOMETRY(MULTIPOLYGON, 4326),
    centroide       GEOMETRY(POINT, 4326),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cantones_provincia ON cantones(provincia_id);
CREATE INDEX idx_cantones_categoria ON cantones(categoria);
CREATE INDEX idx_cantones_geometria ON cantones USING GIST(geometria);
CREATE INDEX idx_cantones_nombre_trgm ON cantones USING GIN(nombre_norm gin_trgm_ops);

-- Tabla unificada de GADs (Municipal o Provincial)
CREATE TABLE gads (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('MUNICIPAL','PROVINCIAL','PARROQUIAL')),
    nombre          VARCHAR(200) NOT NULL,
    nombre_norm     VARCHAR(200) GENERATED ALWAYS AS (unaccent(lower(nombre))) STORED,
    provincia_id    BIGINT REFERENCES provincias(id),
    canton_id       BIGINT REFERENCES cantones(id),
    sitio_web       TEXT,
    portal_transparencia TEXT,
    email           VARCHAR(200),
    telefono        VARCHAR(50),
    direccion       TEXT,
    presupuesto_anual NUMERIC(18, 2),
    empleados       INT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (tipo = 'MUNICIPAL' AND canton_id IS NOT NULL) OR
        (tipo = 'PROVINCIAL' AND provincia_id IS NOT NULL AND canton_id IS NULL) OR
        (tipo = 'PARROQUIAL')
    )
);

CREATE INDEX idx_gads_tipo ON gads(tipo);
CREATE INDEX idx_gads_provincia ON gads(provincia_id);
CREATE INDEX idx_gads_canton ON gads(canton_id);
CREATE INDEX idx_gads_nombre_trgm ON gads USING GIN(nombre_norm gin_trgm_ops);

-- =============================================================================
-- 2. AUTORIDADES Y PERÍODOS POLÍTICOS
-- =============================================================================

CREATE TABLE partidos_politicos (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    nombre_corto    VARCHAR(50),
    nombre_norm     VARCHAR(200) GENERATED ALWAYS AS (unaccent(lower(nombre))) STORED,
    color_hex       VARCHAR(7),
    ideologia       VARCHAR(100),
    fundacion       DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partidos_nombre_trgm ON partidos_politicos USING GIN(nombre_norm gin_trgm_ops);

CREATE TABLE autoridades (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    nombre_completo     VARCHAR(255) NOT NULL,
    nombre_norm         VARCHAR(255) GENERATED ALWAYS AS (unaccent(lower(nombre_completo))) STORED,
    cargo               VARCHAR(50) NOT NULL CHECK (cargo IN ('ALCALDE','PREFECTO','VICEALCALDE','VICEPREFECTO','CONCEJAL','ASAMBLEISTA')),
    gad_id              BIGINT REFERENCES gads(id),
    provincia_id        BIGINT REFERENCES provincias(id),
    canton_id           BIGINT REFERENCES cantones(id),
    partido_id          BIGINT REFERENCES partidos_politicos(id),
    alianza             BOOLEAN DEFAULT FALSE,
    coalicion           TEXT,
    porcentaje_votos    NUMERIC(5, 4),
    periodo_inicio      DATE,
    periodo_fin         DATE,
    biografia           TEXT,
    foto_url            TEXT,
    twitter             VARCHAR(100),
    instagram           VARCHAR(100),
    facebook            VARCHAR(100),
    linkedin            VARCHAR(200),
    email               VARCHAR(200),
    telefono            VARCHAR(50),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autoridades_gad ON autoridades(gad_id);
CREATE INDEX idx_autoridades_cargo ON autoridades(cargo);
CREATE INDEX idx_autoridades_nombre_trgm ON autoridades USING GIN(nombre_norm gin_trgm_ops);
CREATE INDEX idx_autoridades_partido ON autoridades(partido_id);

-- =============================================================================
-- 3. MODELO METODOLÓGICO: DIMENSIONES, VARIABLES, INDICADORES
-- =============================================================================

CREATE TABLE dimensiones (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     TEXT,
    ponderacion     NUMERIC(5, 2) NOT NULL CHECK (ponderacion BETWEEN 0 AND 100),
    color_hex       VARCHAR(7),
    icono           VARCHAR(50),
    orden           INT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE variables (
    id              BIGSERIAL PRIMARY KEY,
    dimension_id    BIGINT NOT NULL REFERENCES dimensiones(id) ON DELETE CASCADE,
    codigo          VARCHAR(30) UNIQUE NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    peso            NUMERIC(5, 2) NOT NULL,
    orden           INT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variables_dimension ON variables(dimension_id);

CREATE TABLE indicadores (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    variable_id     BIGINT NOT NULL REFERENCES variables(id) ON DELETE CASCADE,
    codigo          VARCHAR(40) UNIQUE NOT NULL,
    nombre          VARCHAR(250) NOT NULL,
    descripcion     TEXT,
    tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('POSITIVO','NEGATIVO','NEUTRO')),
    unidad          VARCHAR(50),
    formula         TEXT,
    peso            NUMERIC(5, 2) NOT NULL,
    valor_min       NUMERIC(15, 4),
    valor_max       NUMERIC(15, 4),
    fuente          VARCHAR(200),
    frecuencia      VARCHAR(20) CHECK (frecuencia IN ('MENSUAL','TRIMESTRAL','SEMESTRAL','ANUAL')),
    aplica_municipal  BOOLEAN NOT NULL DEFAULT TRUE,
    aplica_provincial BOOLEAN NOT NULL DEFAULT TRUE,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_indicadores_variable ON indicadores(variable_id);
CREATE INDEX idx_indicadores_tipo ON indicadores(tipo);

-- =============================================================================
-- 4. MEDICIONES (HECHOS) — particionado por año
-- =============================================================================

CREATE TABLE mediciones (
    id              BIGSERIAL,
    uuid            UUID NOT NULL DEFAULT uuid_generate_v4(),
    indicador_id    BIGINT NOT NULL REFERENCES indicadores(id),
    gad_id          BIGINT NOT NULL REFERENCES gads(id),
    valor           NUMERIC(18, 6) NOT NULL,
    valor_normalizado NUMERIC(6, 4),
    fecha           DATE NOT NULL,
    periodo         VARCHAR(20),
    fuente          TEXT,
    metodo_recoleccion VARCHAR(50) CHECK (metodo_recoleccion IN ('SCRAPING','API','MANUAL','OCR','ENCUESTA','EXPERTO')),
    confiabilidad   NUMERIC(3, 2) CHECK (confiabilidad BETWEEN 0 AND 1),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, fecha)
) PARTITION BY RANGE (fecha);

CREATE INDEX idx_mediciones_indicador_gad ON mediciones(indicador_id, gad_id);
CREATE INDEX idx_mediciones_gad_fecha ON mediciones(gad_id, fecha DESC);
CREATE INDEX idx_mediciones_periodo ON mediciones(periodo);

-- Particiones anuales (2023-2030)
CREATE TABLE mediciones_2023 PARTITION OF mediciones FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE mediciones_2024 PARTITION OF mediciones FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE mediciones_2025 PARTITION OF mediciones FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE mediciones_2026 PARTITION OF mediciones FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE mediciones_2027 PARTITION OF mediciones FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE mediciones_2028 PARTITION OF mediciones FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');
CREATE TABLE mediciones_2029 PARTITION OF mediciones FOR VALUES FROM ('2029-01-01') TO ('2030-01-01');

-- =============================================================================
-- 5. SCORING — INGEL Y SUB-ÍNDICES
-- =============================================================================

CREATE TABLE scoring (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    gad_id          BIGINT NOT NULL REFERENCES gads(id),
    fecha_corte     DATE NOT NULL,
    -- Índice Nacional de Gestión Local
    ingel           NUMERIC(6, 3) NOT NULL CHECK (ingel BETWEEN 0 AND 100),
    -- Sub-índices por dimensión (alineados a metodología SIGEL)
    transparencia       NUMERIC(6, 3) CHECK (transparencia BETWEEN 0 AND 100),
    finanzas            NUMERIC(6, 3) CHECK (finanzas BETWEEN 0 AND 100),
    servicios           NUMERIC(6, 3) CHECK (servicios BETWEEN 0 AND 100),
    desarrollo          NUMERIC(6, 3) CHECK (desarrollo BETWEEN 0 AND 100),
    gestion_institucional NUMERIC(6, 3) CHECK (gestion_institucional BETWEEN 0 AND 100),
    participacion       NUMERIC(6, 3) CHECK (participacion BETWEEN 0 AND 100),
    legitimidad         NUMERIC(6, 3) CHECK (legitimidad BETWEEN 0 AND 100),
    innovacion          NUMERIC(6, 3) CHECK (innovacion BETWEEN 0 AND 100),
    -- Índices complementarios
    iri             NUMERIC(6, 3),  -- Índice de Riesgo Institucional
    itd             NUMERIC(6, 3),  -- Índice de Transparencia Digital
    icdl            NUMERIC(6, 3),  -- Índice de Calidad Democrática Local
    -- Clasificación automática
    nivel_desempeno VARCHAR(20) CHECK (nivel_desempeno IN ('EXCELENTE','ALTO','MEDIO','BAJO','CRITICO')),
    semaforo        VARCHAR(10) CHECK (semaforo IN ('VERDE','AMARILLO','ROJO')),
    -- Ranking
    ranking_nacional        INT,
    ranking_provincial      INT,
    ranking_cluster         INT,
    -- Metadatos del cálculo
    componente_objetivo     NUMERIC(6, 3),
    componente_ciudadano    NUMERIC(6, 3),
    componente_experto      NUMERIC(6, 3),
    detalle_calculo         JSONB,
    version_algoritmo       VARCHAR(20) DEFAULT '1.0.0',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (gad_id, fecha_corte)
);

CREATE INDEX idx_scoring_gad_fecha ON scoring(gad_id, fecha_corte DESC);
CREATE INDEX idx_scoring_ingel ON scoring(ingel DESC);
CREATE INDEX idx_scoring_fecha ON scoring(fecha_corte DESC);
CREATE INDEX idx_scoring_ranking_nacional ON scoring(ranking_nacional);

-- =============================================================================
-- 6. USUARIOS, ROLES Y PERMISOS
-- =============================================================================

CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(30) UNIQUE NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    permisos        JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuarios (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    nombre          VARCHAR(150),
    apellido        VARCHAR(150),
    cedula          VARCHAR(20),
    telefono        VARCHAR(30),
    rol_id          BIGINT NOT NULL REFERENCES roles(id),
    avatar_url      TEXT,
    provincia_id    BIGINT REFERENCES provincias(id),
    canton_id       BIGINT REFERENCES cantones(id),
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_habilitado  BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret      TEXT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);

CREATE TABLE sesiones_jwt (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    refresh_token_hash  TEXT NOT NULL,
    ip              INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sesiones_usuario ON sesiones_jwt(usuario_id);
CREATE INDEX idx_sesiones_expires ON sesiones_jwt(expires_at) WHERE NOT revoked;

-- =============================================================================
-- 7. ENCUESTAS CIUDADANAS
-- =============================================================================

CREATE TABLE encuestas (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    tipo            VARCHAR(30) CHECK (tipo IN ('PERCEPCION','SATISFACCION','PARTICIPACION','CONTROL_SOCIAL')),
    fecha_inicio    DATE,
    fecha_fin       DATE,
    activa          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE preguntas_encuesta (
    id              BIGSERIAL PRIMARY KEY,
    encuesta_id     BIGINT NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    codigo          VARCHAR(30),
    bloque          VARCHAR(50),
    pregunta        TEXT NOT NULL,
    tipo_respuesta  VARCHAR(30) CHECK (tipo_respuesta IN ('LIKERT_5','SI_NO','MULTIPLE','ABIERTA','NUMERICA')),
    indicador_id    BIGINT REFERENCES indicadores(id),
    obligatoria     BOOLEAN NOT NULL DEFAULT TRUE,
    orden           INT
);

CREATE TABLE respuestas_ciudadanas (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    encuesta_id     BIGINT NOT NULL REFERENCES encuestas(id),
    usuario_id      BIGINT REFERENCES usuarios(id),
    gad_id          BIGINT NOT NULL REFERENCES gads(id),
    confianza       SMALLINT CHECK (confianza BETWEEN 1 AND 5),
    transparencia   SMALLINT CHECK (transparencia BETWEEN 1 AND 5),
    satisfaccion    SMALLINT CHECK (satisfaccion BETWEEN 1 AND 5),
    participacion   SMALLINT CHECK (participacion BETWEEN 1 AND 5),
    corrupcion      SMALLINT CHECK (corrupcion BETWEEN 1 AND 5),
    servicios       SMALLINT CHECK (servicios BETWEEN 1 AND 5),
    respuestas_detalle  JSONB,
    edad            SMALLINT,
    sexo            VARCHAR(20),
    nivel_educativo VARCHAR(50),
    zona            VARCHAR(20) CHECK (zona IN ('URBANA','RURAL','MIXTA')),
    ip_hash         TEXT,
    geolocation     GEOMETRY(POINT, 4326),
    canal           VARCHAR(20) CHECK (canal IN ('WEB','APP','QR','PRESENCIAL','WHATSAPP')),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_respuestas_gad ON respuestas_ciudadanas(gad_id);
CREATE INDEX idx_respuestas_fecha ON respuestas_ciudadanas(fecha DESC);
CREATE INDEX idx_respuestas_geo ON respuestas_ciudadanas USING GIST(geolocation);

-- =============================================================================
-- 8. DENUNCIAS CIUDADANAS
-- =============================================================================

CREATE TABLE denuncias (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    codigo_publico  VARCHAR(20) UNIQUE NOT NULL,
    usuario_id      BIGINT REFERENCES usuarios(id),
    gad_id          BIGINT NOT NULL REFERENCES gads(id),
    autoridad_id    BIGINT REFERENCES autoridades(id),
    tipo            VARCHAR(40) NOT NULL CHECK (tipo IN
        ('CORRUPCION','OPACIDAD','MAL_SERVICIO','ABUSO','NEGLIGENCIA','OBRA_INCONCLUSA','MALA_GESTION','OTRO')),
    asunto          VARCHAR(300) NOT NULL,
    descripcion     TEXT NOT NULL,
    evidencias      JSONB,
    estado          VARCHAR(30) NOT NULL DEFAULT 'NUEVA' CHECK (estado IN
        ('NUEVA','EN_REVISION','VERIFICADA','RESUELTA','RECHAZADA','ARCHIVADA')),
    prioridad       VARCHAR(10) CHECK (prioridad IN ('ALTA','MEDIA','BAJA')),
    anonima         BOOLEAN NOT NULL DEFAULT FALSE,
    geolocation     GEOMETRY(POINT, 4326),
    riesgo_score    NUMERIC(5, 2),
    clasificacion_ia JSONB,
    fecha_hechos    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_denuncias_gad ON denuncias(gad_id);
CREATE INDEX idx_denuncias_estado ON denuncias(estado);
CREATE INDEX idx_denuncias_tipo ON denuncias(tipo);
CREATE INDEX idx_denuncias_geo ON denuncias USING GIST(geolocation);

CREATE TABLE seguimiento_denuncias (
    id              BIGSERIAL PRIMARY KEY,
    denuncia_id     BIGINT NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
    usuario_id      BIGINT REFERENCES usuarios(id),
    estado_anterior VARCHAR(30),
    estado_nuevo    VARCHAR(30),
    comentario      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 9. ALERTAS AUTOMÁTICAS
-- =============================================================================

CREATE TABLE alertas (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    gad_id          BIGINT REFERENCES gads(id),
    tipo            VARCHAR(40) NOT NULL CHECK (tipo IN
        ('ADMINISTRATIVA','DEMOCRATICA','FISCAL','REPUTACIONAL','ANOMALIA','RIESGO','CUMPLIMIENTO')),
    nivel           VARCHAR(10) NOT NULL CHECK (nivel IN ('CRITICO','ALTO','MEDIO','BAJO')),
    titulo          VARCHAR(300) NOT NULL,
    descripcion     TEXT,
    indicador_id    BIGINT REFERENCES indicadores(id),
    valor_observado NUMERIC(18, 6),
    umbral          NUMERIC(18, 6),
    detectado_por   VARCHAR(50) CHECK (detectado_por IN ('UMBRAL','ISOLATION_FOREST','ZSCORE','RANDOM_FOREST','MANUAL')),
    metadata        JSONB,
    estado          VARCHAR(30) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA','RESUELTA','FALSA_ALARMA','ARCHIVADA')),
    notificada      BOOLEAN NOT NULL DEFAULT FALSE,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resuelta_at     TIMESTAMPTZ
);

CREATE INDEX idx_alertas_gad ON alertas(gad_id);
CREATE INDEX idx_alertas_nivel ON alertas(nivel);
CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_fecha ON alertas(fecha DESC);

-- =============================================================================
-- 10. SCRAPING & ETL
-- =============================================================================

CREATE TABLE fuentes_datos (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(50) UNIQUE NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    tipo            VARCHAR(20) CHECK (tipo IN ('API','SCRAPING','PDF','CSV','MANUAL','OCR')),
    url_base        TEXT,
    descripcion     TEXT,
    autenticacion   JSONB,
    activa          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scraping_jobs (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    fuente_id       BIGINT REFERENCES fuentes_datos(id),
    gad_id          BIGINT REFERENCES gads(id),
    url             TEXT NOT NULL,
    spider          VARCHAR(100),
    estado          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN
        ('PENDIENTE','EJECUTANDO','EXITOSO','FALLIDO','PARCIAL')),
    iniciado_at     TIMESTAMPTZ,
    finalizado_at   TIMESTAMPTZ,
    items_extraidos INT DEFAULT 0,
    errores         INT DEFAULT 0,
    log             TEXT,
    resultado       JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraping_estado ON scraping_jobs(estado);
CREATE INDEX idx_scraping_gad ON scraping_jobs(gad_id);

CREATE TABLE documentos (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    gad_id          BIGINT REFERENCES gads(id),
    tipo            VARCHAR(40) CHECK (tipo IN
        ('LOTAIP','PRESUPUESTO','CONTRATACION','PDOT','RENDICION','INFORME','ACTA','OTRO')),
    titulo          VARCHAR(500),
    url_original    TEXT,
    storage_key     TEXT,
    formato         VARCHAR(10),
    fecha_documento DATE,
    hash_contenido  VARCHAR(64),
    texto_extraido  TEXT,
    ocr_aplicado    BOOLEAN NOT NULL DEFAULT FALSE,
    metadata        JSONB,
    fecha_scrapeo   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentos_gad ON documentos(gad_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo);
CREATE INDEX idx_documentos_hash ON documentos(hash_contenido);
CREATE INDEX idx_documentos_texto ON documentos USING GIN(to_tsvector('spanish', coalesce(texto_extraido,'')));

-- =============================================================================
-- 11. AUDITORÍA
-- =============================================================================

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT REFERENCES usuarios(id),
    accion          VARCHAR(50) NOT NULL,
    tabla           VARCHAR(50),
    registro_id     BIGINT,
    valor_anterior  JSONB,
    valor_nuevo     JSONB,
    ip              INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_fecha ON audit_log(created_at DESC);
CREATE INDEX idx_audit_tabla ON audit_log(tabla, registro_id);

-- =============================================================================
-- 12. CLÚSTERES TERRITORIALES (K-Means resultados)
-- =============================================================================

CREATE TABLE clusters_territoriales (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    centroide       JSONB,
    variables_usadas TEXT[],
    fecha_calculo   DATE NOT NULL DEFAULT CURRENT_DATE,
    version_algoritmo VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gad_cluster (
    id              BIGSERIAL PRIMARY KEY,
    gad_id          BIGINT NOT NULL REFERENCES gads(id),
    cluster_id      BIGINT NOT NULL REFERENCES clusters_territoriales(id),
    distancia       NUMERIC(10, 4),
    fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (gad_id, fecha_asignacion)
);

-- =============================================================================
-- TRIGGERS: actualizar updated_at automáticamente
-- =============================================================================

CREATE OR REPLACE FUNCTION sigel.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_provincias_updated BEFORE UPDATE ON provincias FOR EACH ROW EXECUTE FUNCTION sigel.set_updated_at();
CREATE TRIGGER tg_cantones_updated BEFORE UPDATE ON cantones FOR EACH ROW EXECUTE FUNCTION sigel.set_updated_at();
CREATE TRIGGER tg_gads_updated BEFORE UPDATE ON gads FOR EACH ROW EXECUTE FUNCTION sigel.set_updated_at();
CREATE TRIGGER tg_autoridades_updated BEFORE UPDATE ON autoridades FOR EACH ROW EXECUTE FUNCTION sigel.set_updated_at();
CREATE TRIGGER tg_usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION sigel.set_updated_at();
CREATE TRIGGER tg_denuncias_updated BEFORE UPDATE ON denuncias FOR EACH ROW EXECUTE FUNCTION sigel.set_updated_at();

-- =============================================================================
-- FIN MIGRACIÓN 0001
-- =============================================================================
