# SIGEL — Manual Técnico

Versión 1.0 · Enero 2025

---

## 1. Visión arquitectónica (C4 nivel 1)

SIGEL es una plataforma de **microservicios cloud-native** organizada en cuatro
contextos:

```
                ┌──────────────────────────────────────┐
                │           CIUDADANOS (~16M)          │
                │  Web + móvil (PWA)                   │
                └────────────────┬─────────────────────┘
                                 │
                ┌────────────────▼─────────────────────┐
                │      SISTEMA SIGEL (este repo)       │
                │  ┌─────────────────────────────────┐ │
                │  │  Frontend Next.js (apps/web)    │ │
                │  ├─────────────────────────────────┤ │
                │  │  Gateway NestJS (REST+GraphQL)  │ │
                │  ├─────────────────────────────────┤ │
                │  │  Microservicios Python          │ │
                │  │   • Analytics (scoring/ML)      │ │
                │  │   • AI (NLP/OCR)                │ │
                │  │   • Scraper (Scrapy)            │ │
                │  ├─────────────────────────────────┤ │
                │  │  Datos: PostgreSQL+PostGIS,     │ │
                │  │         Redis, MongoDB          │ │
                │  └─────────────────────────────────┘ │
                └────────────────┬─────────────────────┘
                                 │
        ┌────────────────────────┼─────────────────────────┐
        ▼                        ▼                         ▼
  ┌────────────┐         ┌──────────────┐         ┌──────────────┐
  │ SERCOP API │         │ Min. Finanzas│         │ Portales GAD │
  │ (datos     │         │ (presupuestos)│        │ (LOTAIP HTML)│
  │  abiertos) │         └──────────────┘         └──────────────┘
  └────────────┘
```

## 2. C4 nivel 2 — Contenedores

| Contenedor    | Tecnología               | Puerto | Réplicas (prod) | Persistencia       |
|---------------|--------------------------|--------|-----------------|--------------------|
| Frontend      | Next.js 14 + React 18    | 4000   | 3–10            | Stateless          |
| Gateway       | NestJS 10 + Fastify      | 3000   | 3–20            | Stateless          |
| Analytics     | FastAPI + Python 3.11    | 8000   | 2–10            | Modelos en PVC     |
| AI            | FastAPI + transformers   | 8001   | 2–5             | Stateless          |
| Scraper       | Scrapy (CronJob)         | —      | 1 por job       | Stateless          |
| PostgreSQL    | postgis/postgis:15-3.4   | 5432   | 1 (HA via PgBouncer) | StatefulSet/RDS |
| Redis         | redis:7-alpine           | 6379   | 1 (HA via Sentinel/ElastiCache) | Stateless cache |
| MongoDB       | mongo:7                  | 27017  | 1               | StatefulSet/Atlas  |
| NGINX         | nginx:alpine             | 80/443 | 3 (Ingress)     | Stateless          |

## 3. Flujo de datos: cálculo del INGEL

```
┌──────────────────────────────────────────────────────────────┐
│  1. INGESTA                                                  │
│     • Scraper LOTAIP → sigel.documentos + sigel.mediciones   │
│     • API SERCOP/MEF → sigel.mediciones                      │
│     • Encuestas web/app → sigel.respuestas_ciudadanas        │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  2. NORMALIZACIÓN (analytics/services/normalizer.py)         │
│     • Min-Max por tipo de indicador (POSITIVO/NEGATIVO)      │
│     • Validación de consistencia (Z-Score)                   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  3. AGREGACIÓN POR DIMENSIÓN                                 │
│     • Promedio ponderado por variables                       │
│     • 8 dimensiones SIGEL                                    │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  4. COMBINACIÓN DE COMPONENTES                               │
│     INGEL = 0.60·Obj + 0.25·Ciud + 0.15·Exp                 │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  5. INDICES DERIVADOS                                        │
│     • IRI (Riesgo Institucional)                             │
│     • ITD (Transparencia Digital)                            │
│     • ICDL (Calidad Democrática Local)                       │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  6. PERSISTENCIA + RANKING                                   │
│     • UPSERT en sigel.scoring                                │
│     • Trigger autoclasifica nivel + semáforo                 │
│     • recalcular_ranking_nacional()                          │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  7. ALERTAS AUTOMÁTICAS                                      │
│     • Umbrales (transparencia<40, ejecución<50, deuda>80)    │
│     • Isolation Forest → anomalías                           │
│     • Random Forest → riesgo institucional                   │
└──────────────────────────────────────────────────────────────┘
```

## 4. Esquema de datos (resumen)

25 tablas en el schema `sigel`:

**Territoriales:** `regiones`, `provincias` (24), `cantones` (218), `gads` (241).

**Modelo metodológico:** `dimensiones` (8), `variables` (~32), `indicadores`
(~80), `mediciones` (particionada por año).

**Política:** `partidos_politicos`, `autoridades` (alcaldes/prefectos/asambleístas).

**Scoring:** `scoring` (con INGEL, sub-índices, IRI, ITD, ICDL, ranking, semáforo).

**Participación:** `encuestas`, `preguntas_encuesta`, `respuestas_ciudadanas`,
`denuncias`, `seguimiento_denuncias`.

**Operación:** `alertas`, `fuentes_datos`, `scraping_jobs`, `documentos`.

**Clustering:** `clusters_territoriales`, `gad_cluster`.

**Seguridad:** `roles`, `usuarios`, `sesiones_jwt`, `audit_log`.

Ver: [`db/migrations/0001_init_schema.sql`](../../db/migrations/0001_init_schema.sql).

## 5. Endpoints REST principales

| Método | Path                                    | Descripción                       |
|--------|-----------------------------------------|-----------------------------------|
| POST   | `/api/v1/auth/register`                 | Registro ciudadano                |
| POST   | `/api/v1/auth/login`                    | Login (+ MFA)                     |
| POST   | `/api/v1/auth/refresh`                  | Refresh JWT                       |
| GET    | `/api/v1/territorios/provincias`        | 24 provincias                     |
| GET    | `/api/v1/territorios/cantones`          | 218 cantones (filtrable)          |
| GET    | `/api/v1/territorios/gads`              | 241 GADs                          |
| GET    | `/api/v1/autoridades?cargo=ALCALDE`     | Alcaldes electos                  |
| GET    | `/api/v1/indicadores/dimensiones`       | 8 dimensiones del modelo          |
| GET    | `/api/v1/scoring/ranking/nacional`      | Ranking INGEL nacional            |
| GET    | `/api/v1/scoring/gad/:id`               | Scoring actual de un GAD          |
| GET    | `/api/v1/scoring/gad/:id/evolucion`     | Serie temporal                    |
| POST   | `/api/v1/scoring/gad/:id/recalcular`    | Disparar recálculo                |
| POST   | `/api/v1/encuestas/responder`           | Captura ciudadana (Likert 1-5)    |
| POST   | `/api/v1/denuncias`                     | Crear denuncia (puede ser anónima)|
| GET    | `/api/v1/denuncias/codigo/:codigo`      | Seguimiento por código público    |
| GET    | `/api/v1/alertas?nivel=ALTO`            | Alertas activas                   |

Spec completa: [`docs/api/openapi.yaml`](../api/openapi.yaml).

## 6. GraphQL

Endpoint: `POST /graphql`. Esquema federado expone:

```graphql
type Query {
  provincias: [Provincia!]!
  cantones(provinciaId: ID): [Canton!]!
  gads(tipo: GadTipo): [Gad!]!
  rankingNacional(limit: Int = 50): [ScoringEntry!]!
  autoridades(cargo: CargoAutoridad): [Autoridad!]!
  dimensiones: [Dimension!]!
  scoringGad(id: ID!): Scoring
}

type Mutation {
  responderEncuesta(input: RespuestaInput!): Respuesta!
  crearDenuncia(input: DenunciaInput!): Denuncia!
}

type Subscription {
  nuevasAlertas: Alerta!
}
```

## 7. Modelos de Machine Learning

| Modelo               | Librería        | Objetivo                              | Frecuencia reentrenamiento |
|----------------------|-----------------|---------------------------------------|----------------------------|
| Isolation Forest     | scikit-learn    | Detección de mediciones atípicas      | Mensual (CronJob)          |
| K-Means              | scikit-learn    | Clustering territorial (5 grupos)     | Trimestral                 |
| Random Forest        | scikit-learn    | Predicción de riesgo institucional    | Mensual                    |
| BETO (sentiment)     | transformers    | Sentimiento de comentarios            | On-demand                  |
| Pipeline NLP custom  | spaCy + lexicón | Clasificación temática de denuncias   | Manual                     |

## 8. Observabilidad

- **Métricas:** Prometheus (puertos `/metrics` en gateway, analytics, ai).
- **Logs:** stdout JSON estructurado (Pino/structlog) → Loki.
- **Dashboards:** Grafana (provisionado con dashboards SIGEL).
- **Errores:** Sentry (opt-in via env var `SENTRY_DSN`).
- **Tracing:** OpenTelemetry (preparado, opt-in via `OTEL_EXPORTER_OTLP_ENDPOINT`).

## 9. Roadmap operativo

| Fase                  | Duración | Estado |
|-----------------------|----------|--------|
| 1. Diseño técnico     | 3 meses  | ✅ Completado |
| 2. Piloto (10 cantones)| 6 meses | 🟡 En curso  |
| 3. Escalamiento (241 GAD) | 12 meses | ⏳ Pendiente |
| 4. Automatización IA  | 18 meses | ⏳ Pendiente |
