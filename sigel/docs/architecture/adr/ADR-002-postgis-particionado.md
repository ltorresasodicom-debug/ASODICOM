# ADR-002 — PostgreSQL+PostGIS con particionado temporal

**Estado:** Aceptada
**Fecha:** 2025-01-15

## Decisión

Adoptar **PostgreSQL 15 con PostGIS 3.4** como base de datos principal, con
**particionado RANGE por año** en la tabla `mediciones` (la única que crecerá
linealmente con el tiempo a escala nacional).

## Justificación

- **PostGIS** permite consultas geoespaciales nativas (`ST_Within`, `ST_DWithin`)
  necesarias para el mapa coroplético y análisis territorial.
- `pg_trgm` + `unaccent` ofrecen búsqueda tolerante a tildes y typos en
  nombres de cantones/autoridades.
- `pgcrypto` cubre necesidades de hashing y cifrado en reposo a nivel columna.
- El particionado por año mantiene los índices pequeños y permite drop rápido
  de particiones históricas en el futuro (cumplimiento de retención).
- 241 GADs × ~80 indicadores × frecuencia diaria ≈ 7M filas/año en `mediciones`.

## Alternativas descartadas

- **ClickHouse**: superior para queries OLAP, pero introduce complejidad de
  sincronización y duplicación de datos. Reservado para una segunda fase si
  el volumen lo amerita.
- **MongoDB como primaria**: descartado por necesidad de joins y transacciones
  ACID en `scoring` + `mediciones`. Mongo se usa sólo para logs y datos raw.
