# Metodología SIGEL — Traducción a código

Este documento mapea cada sección del modelo metodológico SIGEL a su
correspondiente implementación técnica en el repositorio.

## Tabla de correspondencia

| Sección metodológica | Implementación                                                        |
|-----------------------|----------------------------------------------------------------------|
| §8 Dimensiones (8)    | `db/seeds/01_dimensiones_y_referencias.sql`                          |
| §9 Ponderaciones      | `services/analytics/app/core/config.py` (Settings.weight_*)          |
| §10.A Scraping        | `services/scraper/sigel_scraper/spiders/`                            |
| §10.B Encuestas       | `apps/web/src/app/encuestas/page.tsx` + `gateway/encuestas/`         |
| §10.C Verif. doc.     | Spiders LOTAIP/SERCOP/Finanzas/INEC                                  |
| §10.D Panel experto   | Tabla `usuarios` rol `EXPERTO` (futuro)                              |
| §11 Escalas           | Constraints CHECK BETWEEN 1 AND 5 en `respuestas_ciudadanas`         |
| §12 Índices compuestos| `services/analytics/app/services/ingel.py`                           |
| §1.3 Arquitectura     | `INGEL = 0.60*Obj + 0.25*Ciud + 0.15*Exp` (combinar_componentes)     |
| §1.4 Min-Max          | `services/analytics/app/services/normalizer.py`                      |
| §1.5 Pesos jerárquicos| `dimensiones.ponderacion` + `variables.peso` + `indicadores.peso`    |
| §1.8 Clasificación    | Función `clasificar_nivel()` (SQL + Python)                          |
| §1.9 Semaforización   | Función `semaforizar()` (SQL + Python)                               |
| §1.10 Alertas         | Tabla `alertas` + triggers + analytics anomaly detector              |
| §1.11 Anomalías       | `services/analytics/app/ml/anomaly.py` (Isolation Forest)            |
| §1.12 Clusters K-Means| `services/analytics/app/ml/clustering.py`                            |
| §1.13 IRI             | `calcular_iri()` en `ingel.py`                                       |
| §2.12 Random Forest   | `services/analytics/app/ml/risk_predictor.py`                        |

## Validación metodológica

Para satisfacer §14 (validez y confiabilidad):

- **Validez de contenido:** panel experto vía rol `EXPERTO` (pendiente).
- **Validez de constructo:** análisis factorial sobre `mediciones` con
  `factor-analyzer` (notebook en `docs/methodology/factorial.ipynb`).
- **Confiabilidad (Alpha de Cronbach):** función SQL `cronbach_alpha()`
  (pendiente — primera iteración del piloto).

## Frecuencia de recolección (§15)

| Tipo de medición   | Frecuencia       | Mecanismo              |
|--------------------|------------------|------------------------|
| Transparencia      | Mensual          | CronJob `scraper-lotaip` 02:00 UTC |
| Finanzas           | Trimestral       | CronJob `scraper-finanzas` |
| Ciudadana          | Semestral        | Campañas en `apps/web/encuestas` |
| Integral (INGEL)   | Anual + diaria   | CronJob `recalcular-scoring` 04:00 UTC |
