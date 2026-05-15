-- =============================================================================
-- SIGEL — Funciones SQL para scoring y agregaciones
-- =============================================================================
SET search_path TO sigel, public;

-- Normalización Min-Max para un indicador POSITIVO (mayor=mejor)
CREATE OR REPLACE FUNCTION normalizar_positivo(
    valor numeric, valor_min numeric, valor_max numeric
) RETURNS numeric AS $$
BEGIN
    IF valor IS NULL OR valor_max IS NULL OR valor_min IS NULL OR valor_max = valor_min THEN
        RETURN NULL;
    END IF;
    RETURN LEAST(1.0, GREATEST(0.0, (valor - valor_min) / (valor_max - valor_min)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Normalización para indicador NEGATIVO (menor=mejor)
CREATE OR REPLACE FUNCTION normalizar_negativo(
    valor numeric, valor_min numeric, valor_max numeric
) RETURNS numeric AS $$
BEGIN
    IF valor IS NULL OR valor_max IS NULL OR valor_min IS NULL OR valor_max = valor_min THEN
        RETURN NULL;
    END IF;
    RETURN LEAST(1.0, GREATEST(0.0, (valor_max - valor) / (valor_max - valor_min)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Clasificación de nivel a partir de puntaje
CREATE OR REPLACE FUNCTION clasificar_nivel(puntaje numeric)
RETURNS text AS $$
BEGIN
    IF puntaje IS NULL THEN RETURN NULL; END IF;
    IF puntaje >= 90 THEN RETURN 'EXCELENTE';
    ELSIF puntaje >= 75 THEN RETURN 'ALTO';
    ELSIF puntaje >= 60 THEN RETURN 'MEDIO';
    ELSIF puntaje >= 40 THEN RETURN 'BAJO';
    ELSE RETURN 'CRITICO';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Semaforización
CREATE OR REPLACE FUNCTION semaforizar(puntaje numeric)
RETURNS text AS $$
BEGIN
    IF puntaje IS NULL THEN RETURN NULL; END IF;
    IF puntaje >= 70 THEN RETURN 'VERDE';
    ELSIF puntaje >= 50 THEN RETURN 'AMARILLO';
    ELSE RETURN 'ROJO';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calcula el INGEL agregado a partir de los 8 sub-índices con ponderaciones SIGEL
CREATE OR REPLACE FUNCTION calcular_ingel(
    transparencia numeric,
    finanzas numeric,
    servicios numeric,
    desarrollo numeric,
    gestion_institucional numeric,
    participacion numeric,
    legitimidad numeric,
    innovacion numeric
) RETURNS numeric AS $$
BEGIN
    RETURN ROUND(
        (COALESCE(transparencia,0)        * 0.20 +
         COALESCE(finanzas,0)             * 0.15 +
         COALESCE(servicios,0)            * 0.20 +
         COALESCE(desarrollo,0)           * 0.10 +
         COALESCE(gestion_institucional,0)* 0.10 +
         COALESCE(participacion,0)        * 0.10 +
         COALESCE(legitimidad,0)          * 0.10 +
         COALESCE(innovacion,0)           * 0.05)::numeric,
        3
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Z-Score para detección de anomalías
CREATE OR REPLACE FUNCTION zscore_indicador(p_indicador_id bigint, p_valor numeric)
RETURNS numeric AS $$
DECLARE
    media numeric;
    desv  numeric;
BEGIN
    SELECT AVG(valor), STDDEV(valor)
      INTO media, desv
    FROM mediciones
    WHERE indicador_id = p_indicador_id
      AND fecha >= CURRENT_DATE - INTERVAL '1 year';
    IF desv IS NULL OR desv = 0 THEN RETURN NULL; END IF;
    RETURN ROUND(((p_valor - media) / desv)::numeric, 3);
END;
$$ LANGUAGE plpgsql STABLE;

-- Recalcular ranking nacional (idempotente)
CREATE OR REPLACE FUNCTION recalcular_ranking_nacional(p_fecha date DEFAULT CURRENT_DATE)
RETURNS int AS $$
DECLARE
    afectados int;
BEGIN
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY ingel DESC) AS pos
        FROM scoring
        WHERE fecha_corte = p_fecha
    )
    UPDATE scoring s
       SET ranking_nacional = r.pos
      FROM ranked r
     WHERE s.id = r.id;
    GET DIAGNOSTICS afectados = ROW_COUNT;
    RETURN afectados;
END;
$$ LANGUAGE plpgsql;

-- Trigger: actualizar nivel_desempeno y semaforo al insertar scoring
CREATE OR REPLACE FUNCTION sigel.tg_autoclasificar_scoring()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nivel_desempeno := clasificar_nivel(NEW.ingel);
    NEW.semaforo := semaforizar(NEW.ingel);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_scoring_autoclasificar ON scoring;
CREATE TRIGGER tg_scoring_autoclasificar
BEFORE INSERT OR UPDATE ON scoring
FOR EACH ROW EXECUTE FUNCTION sigel.tg_autoclasificar_scoring();
