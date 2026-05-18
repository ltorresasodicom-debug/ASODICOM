# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout: two distinct projects

This repo contains **two separate SIGEL deliverables** plus a legacy file. Know which one you're touching:

| Path | What it is | Build? |
|---|---|---|
| `sigel-public/` | **The live, deployed product.** Pure static SPA on Netlify (`sigel-ecuador.netlify.app`). This is what users actually use and what gets iterated on. | **No build step** — native ES modules |
| `sigel/` | Enterprise microservices scaffold (NestJS + FastAPI + Scrapy + Next.js + PostgreSQL/PostGIS + K8s). Reference architecture; not deployed. | Per-service builds |
| `README.md` (root) | Legacy ASODICOM static HTML, 97 KB. **Unrelated to SIGEL** — do not treat as project docs. |

Working branch: `claude/govtech-si-platform-baDHw`. Commits use the Spanish, multi-paragraph style already in `git log`.

## The INGEL formula is duplicated by design — keep in sync

The Índice Nacional de Gestión Local scoring logic exists in **two implementations that must stay numerically identical**:

- `sigel/services/analytics/app/services/ingel.py` + `scoring_engine.py` (authoritative; 49 pytest cases in `tests/test_scoring_engine.py`)
- `sigel-public/js/ingel.js` (browser port; sanity-tested against the Python results)

Canonical model: `INGEL = Σ(dimensión × ponderación)` over 8 dimensions (weights 20/15/20/10/10/10/10/5, summing to 1.0), then `0.60·objetivo + 0.25·ciudadano + 0.15·experto`. Likert 1–5 → 0–100 via Min-Max. Classification thresholds (EXCELENTE/ALTO/MEDIO/BAJO/CRITICO) and semaphore (VERDE≥70 / AMARILLO≥50 / ROJO) are also mirrored in `sigel/db/functions/0003_scoring_functions.sql`. **Any change to weights, thresholds, or normalization must be applied to all three (Python, JS, SQL) or rankings diverge.**

## sigel-public architecture (the deployed app)

- **No framework, no bundler.** `index.html` loads `js/app.js` as an ES module. Tailwind, Leaflet, Fuse.js via CDN; jsPDF loaded lazily only when exporting.
- **Routing:** hash-based (`#/ruta`) in `app.js` → calls `viewX(state)` functions that return HTML strings injected into `#app`. Post-render mounts (e.g. Leaflet) run after `innerHTML`.
- **State:** single mutable global `state` object; UI handlers exposed on `window.SIGEL.*` and invoked from inline `onclick`/`oninput` attributes. This is the established pattern — follow it; don't introduce a framework.
- **Data join:** `data/electoral.json` (218 alcaldes + 23 prefectos from the Excel) is joined to `data/cantones-ec.geojson` (224 cantón polygons) by normalized name. The Excel uses abbreviations; `js/utils/canton-aliases.js` maps them to official DPA names to reach 100% match. When adding cantones or fixing a mismatch, edit the alias table — **do not edit the source data files**.
- **GeoJSON provenance:** generated from the INEC shapefile (UTM Zone 17S → WGS84 via pyproj, simplified with shapely tol≈0.008°). The source DBF has a non-standard encoding where byte `0xD0` = Ñ; regeneration scripts must replace `Ð→Ñ` / `ð→ñ` or names like Rumiñahui/Logroño corrupt.
- **PDF export** lives in `js/features/pdf/` (loader + helpers) and `js/templates/report/report.js` (the institutional 5-page layout, vector primitives only — no html2canvas).

Scores in `sigel-public` are **synthetic** (deterministic from vote %); only citizen evaluations use the real INGEL formula. This is intentional for the demo — see `js/data.js` comments.

## Common commands

### sigel-public (validate before every deploy)
```bash
cd sigel-public
node --check js/**/*.js                       # syntax-check all modules (no build to catch errors)
python3 -m http.server 8765                   # serve locally → http://localhost:8765
# Regenerate the cantón GeoJSON from the shapefile: see js/data.js header comment
```
There is no test runner here; validation is `node --check` on every JS module + manual smoke test. Deploy = drop the directory as a ZIP on Netlify, or via local Netlify MCP (sandbox deploys are blocked with 403 "Host not in allowlist").

### sigel/services/analytics (Python, authoritative scoring)
```bash
cd sigel/services/analytics
pip install -e ".[dev]"
pytest                                        # full suite
pytest tests/test_scoring_engine.py -v        # scoring only
pytest tests/test_scoring_engine.py::TestFormulaIngel::test_caso_realista_cuenca   # single test
ruff check . && black .
```

### sigel/services/gateway (NestJS)
```bash
cd sigel/services/gateway
pnpm install && pnpm build
pnpm test                                     # jest; pnpm test -- <file> for one
pnpm lint
```

### sigel/apps/web (Next.js) — `pnpm dev` (port 4000), `pnpm build`, `pnpm test` (vitest)

### Full stack
`cd sigel && docker compose up -d --build` brings up Postgres+PostGIS, Redis, Mongo, all services, NGINX, Prometheus/Grafana. DB auto-initializes from `db/migrations/` → `db/views/` → `db/functions/` → `db/seeds/` (ordered by filename prefix).

## Database

PostgreSQL 15 + PostGIS, schema `sigel`. Apply order matters: `0001_init_schema.sql` (25 tables, `mediciones` partitioned by year) → `0002_analytical_views.sql` → `0003_scoring_functions.sql` → seeds. Seeds are generated from the uploaded Excel via Python scripts; the SQL is committed, the generators are not — regenerate from the source spreadsheet if electoral data changes.
