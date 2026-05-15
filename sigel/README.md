# SIGEL — Sistema Integral de Gestión y Evaluación Local

**Plataforma nacional GovTech del Ecuador para evaluar la gestión de alcaldes y prefectos.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Node 20](https://img.shields.io/badge/Node-20-43853d)](https://nodejs.org)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776ab)](https://python.org)
[![PostgreSQL 15 + PostGIS](https://img.shields.io/badge/PostgreSQL-15%20%2B%20PostGIS-336791)](https://postgresql.org)

> *"Evaluación para la mejora continua, no para la sanción."*

SIGEL mide el desempeño de **23 prefectos** y **218 alcaldes** del Ecuador
mediante el **Índice Nacional de Gestión Local (INGEL)**, un índice
multidimensional que combina:

- **60%** evaluación objetiva (indicadores cuantitativos vía API/scraping)
- **25%** percepción ciudadana (encuestas Likert 1-5)
- **15%** análisis experto

Fundamentado en **ISO 18091** (gobiernos locales), **modelo Infoparticipa**,
**LOTAIP**, **Gobierno Abierto** y mejora continua **PHVA**.

---

## ⚡ Quickstart

```bash
git clone https://github.com/.../sigel
cd sigel

# Stack local con Docker Compose (PostgreSQL+PostGIS, Redis, Mongo, todos los
# microservicios, frontend, NGINX, Prometheus, Grafana)
docker compose up -d --build

# Esperar healthchecks (~60 s)
docker compose ps

# Endpoints disponibles:
#   - Web (Next.js):       http://localhost:4000
#   - Gateway (NestJS):    http://localhost:3000/api/v1
#   - Swagger:             http://localhost:3000/api/docs
#   - Analytics (FastAPI): http://localhost:8000/docs
#   - AI (FastAPI):        http://localhost:8001/docs
#   - NGINX proxy:         http://localhost
#   - Prometheus:          http://localhost:9090
#   - Grafana:             http://localhost:3001 (admin/admin)
```

La BD se inicializa con **23 prefectos + 218 alcaldes** + 18 asambleístas
electos de los comicios seccionales 2023 y Asamblea Nacional 2024.

---

## 🧩 Arquitectura

```
                      ┌─────────────────────┐
                      │   Frontend Next.js  │
                      │   (apps/web)        │
                      └──────────┬──────────┘
                                 │ /api/gateway/*
                      ┌──────────▼──────────┐
                      │  NGINX (proxy/TLS)  │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
        ┌─────────────│  Gateway (NestJS)   │─────────────┐
        │             │  REST + GraphQL     │             │
        │             └──────────┬──────────┘             │
        │                        │                        │
        │ /scoring/*             │ /scoring/recalcular    │ /nlp/*
        ▼                        ▼                        ▼
┌───────────────┐    ┌──────────────────────┐    ┌──────────────┐
│  PostgreSQL   │    │  Analytics (FastAPI) │    │ AI (FastAPI) │
│  + PostGIS    │◄───┤  scoring_engine.py   │    │ NLP, OCR,    │
│               │    │  ML (sklearn)        │    │ clasificador │
└───────┬───────┘    └──────────┬───────────┘    └──────────────┘
        │                       │
        │     ┌─────────────────┘
        │     │ inserta mediciones
        │     ▼
        │  ┌───────────────────┐
        │  │ Scraper (Scrapy)  │
        │  │ LOTAIP/SERCOP/    │
        │  │ Finanzas/INEC     │
        │  └───────────────────┘
        │
        ▼
   ┌────────┐ ┌──────────┐
   │ Redis  │ │ MongoDB  │
   │ cache  │ │ logs/raw │
   └────────┘ └──────────┘
```

**Detalle:** [`docs/architecture/`](docs/architecture/).

---

## 📊 Modelo INGEL — Ponderaciones

| Dimensión                            | Peso | Variables clave                                  |
|--------------------------------------|------|--------------------------------------------------|
| **Transparencia**                    | 20%  | LOTAIP, datos abiertos, rendición de cuentas    |
| **Gestión Financiera**               | 15%  | Ejecución presupuestaria, endeudamiento         |
| **Servicios Públicos**               | 20%  | Agua, basura, movilidad, vialidad rural         |
| **Desarrollo Territorial**           | 10%  | Económico, social, ambiental, ordenamiento (ISO 18091) |
| **Gestión Institucional**            | 10%  | Talento humano, profesionalización              |
| **Participación Ciudadana**          | 10%  | Cabildos, veedurías, presupuesto participativo  |
| **Legitimidad y Confianza**          | 10%  | Encuestas Likert, percepción corrupción         |
| **Innovación Digital**               | 5%   | Trámites virtuales, interoperabilidad, IA       |

**Fórmula:**
```
INGEL = Σ(Dimensión_i × Peso_i) × ComponentesMix
ComponentesMix = 0.60·Objetivo + 0.25·Ciudadano + 0.15·Experto
```

**Clasificación:**

| Puntaje | Nivel       | Semáforo  |
|---------|-------------|-----------|
| 90-100  | EXCELENTE   | 🟢 Verde  |
| 75-89   | ALTO        | 🟢 Verde  |
| 60-74   | MEDIO       | 🟡 Amarillo |
| 40-59   | BAJO        | 🔴 Rojo   |
| 0-39    | CRÍTICO     | 🔴 Rojo   |

---

## 🗂️ Estructura del repositorio

```
sigel/
├── apps/web/              # Frontend Next.js 14 (App Router + TS + Tailwind)
├── services/
│   ├── gateway/           # NestJS — API REST + GraphQL + Auth (JWT, MFA, OAuth2)
│   ├── analytics/         # FastAPI — Scoring engine, ML, ranking
│   ├── ai/                # FastAPI — NLP, OCR, clasificación
│   └── scraper/           # Scrapy — LOTAIP, SERCOP, Finanzas, INEC
├── db/
│   ├── migrations/        # 25 tablas, particionado, índices GIST/GIN
│   ├── views/             # 8 vistas analíticas
│   ├── functions/         # normalizar, INGEL, semáforo, anomalías
│   └── seeds/             # Datos reales del Excel adjunto
├── infra/
│   ├── docker/            # Dockerfiles por servicio
│   ├── k8s/               # Manifiestos Kustomize (base + overlays)
│   └── terraform/         # AWS (EKS, RDS, S3)
├── .github/workflows/     # CI/CD GitHub Actions
└── docs/                  # ADRs, arquitectura, metodología, manual técnico
```

---

## 🚀 Despliegue

### Local (Docker Compose)
```bash
docker compose up -d --build
```

### Kubernetes (staging)
```bash
kubectl apply -k infra/k8s/overlays/staging
```

### Kubernetes (producción)
```bash
kubectl apply -k infra/k8s/overlays/prod
```

Ver guía completa: [`docs/deployment/`](docs/deployment/).

---

## 🔐 Seguridad

- **Autenticación:** JWT (15 min) + refresh token (7d, hash SHA-256, revocable).
- **MFA:** TOTP (RFC 6238) opcional para roles administrativos.
- **OAuth2:** Google (configurable).
- **RBAC:** roles `CIUDADANO`, `OBSERVADOR`, `ANALISTA`, `INVESTIGADOR`, `ADMIN`.
- **Cifrado:** AES-256 en reposo (RDS/EBS), TLS 1.3 en tránsito.
- **Hashing:** Argon2id para contraseñas.
- **Rate limiting:** 10 req/s, 100/min, 1000/hora (Throttler).
- **Auditoría:** todas las acciones administrativas escritas en `sigel.audit_log`.
- **Gitleaks:** escaneo de secretos en CI.

---

## 📚 Documentación

- [Manual técnico](docs/architecture/MANUAL-TECNICO.md)
- [Metodología SIGEL](docs/methodology/METODOLOGIA.md)
- [API Reference](docs/api/openapi.yaml) (OpenAPI 3.1)
- [GraphQL Schema](docs/api/schema.gql)
- [Architecture Decision Records](docs/architecture/adr/)
- [Wireframes](docs/architecture/WIREFRAMES.md)

---

## 🤝 Contribución

Este proyecto es **software público libre**, licenciado bajo
[AGPL-3.0-or-later](LICENSE). Las contribuciones son bienvenidas:

1. Fork → rama `feature/<slug>`.
2. Pull Request a `develop`.
3. Tests verdes + lint OK.
4. Code review por al menos un mantenedor.

---

## 📞 Contacto

- 🌐 Web: https://sigel.gob.ec
- 📧 Email: soporte@sigel.gob.ec
- 🐦 Twitter: @SIGEL_Ecuador
