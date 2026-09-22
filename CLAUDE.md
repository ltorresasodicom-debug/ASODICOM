# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout: two distinct projects

This repo contains **two separate SIGEL deliverables** plus a legacy file. Know which one you're touching:

| Path | What it is | Build? |
|---|---|---|
| `sigel-public/` | **The live, deployed product.** Pure static SPA on Netlify (`sigel-ecuador.netlify.app`). This is what users actually use and what gets iterated on. | **No build step** — native ES modules |
| `sigel/` | Enterprise microservices scaffold (NestJS + FastAPI + Scrapy + Next.js + PostgreSQL/PostGIS + K8s). Reference architecture; not deployed. | Per-service builds |
| `README.md` (root) | Legacy ASODICOM static HTML, 97 KB. **Unrelated to SIGEL** — do not treat as project docs. |

Working branch: `claude/govtech-si-platform-baDHw` (ya mergeado a `main`; ambas ramas contienen el estado actual). Commits usan el estilo español multi-párrafo del `git log`.

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

**Deploy — dos targets activos:**
- **Netlify:** `sigel-ecuador.netlify.app` (drop manual del directorio como ZIP en el panel del proyecto).
- **GitHub Pages:** `ltorresasodicom-debug.github.io/ASODICOM` vía `.github/workflows/pages.yml` (auto-redespliega en push a `main` o a la rama de trabajo). Requiere habilitar una vez en **Settings → Pages → Source: GitHub Actions**.

El sitio usa rutas relativas (`./js/…`, `./data/…`) y router por hash, por eso funciona sin cambios bajo el subpath de project-pages.

## Common commands

### sigel-public (validate before every deploy)
```bash
cd sigel-public
node --check js/**/*.js                       # syntax-check all modules (no build to catch errors)
python3 -m http.server 8765                   # serve locally → http://localhost:8765
# Regenerate the cantón GeoJSON from the shapefile: see js/data.js header comment
```
Validación pre-deploy: `node --check` por cada módulo + el motor de scoring (`js/ingel.js`) tiene 20 sanity tests que replican los 49 pytest del backend Python (ejecutables directamente con `node --input-type=module` importando `./js/ingel.js`). Deploy = drop del directorio como ZIP en el panel Netlify, push a `main`/rama de trabajo para GitHub Pages, o Netlify MCP desde local (los deploys desde sandbox se bloquean con 403 "Host not in allowlist").

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
pnpm test                                     # jest; para un solo archivo: pnpm jest <archivo.spec.ts>
pnpm lint
```

### sigel/apps/web (Next.js) — `pnpm dev` (port 4000), `pnpm build`, `pnpm test` (vitest)

### Full stack
`cd sigel && docker compose up -d --build` brings up Postgres+PostGIS, Redis, Mongo, all services, NGINX, Prometheus/Grafana. DB auto-initializes from `db/migrations/` → `db/views/` → `db/functions/` → `db/seeds/` (ordered by filename prefix).

## Database

PostgreSQL 15 + PostGIS, schema `sigel`. Orden de aplicación estricto:
`db/migrations/0001_init_schema.sql` (25 tablas, `mediciones` particionada por año) →
`db/views/0002_analytical_views.sql` →
`db/functions/0003_scoring_functions.sql` →
`db/seeds/01..06`.

Los seeds se generan desde el Excel original vía scripts Python; el SQL está commiteado, los generadores no — regenera desde el spreadsheet si los datos electorales cambian.

**Reglas duras aprendidas por bugs reales que bloquearon deploys:**

- `unaccent()` del contrib es **STABLE**, no IMMUTABLE. No puede usarse directamente en `GENERATED ALWAYS AS (...)` ni en índices de expresión. El schema define `sigel.immutable_unaccent()` como wrapper IMMUTABLE (fija el diccionario `public.unaccent`). Cualquier columna generada con normalización de texto **debe** usar este wrapper.
- `provincias.codigo_ine` debe usar el **código DPA oficial de 2 dígitos** del shapefile INEC (disponible en `sigel-public/data/cantones-ec.geojson` como `provincia_codigo`). El generador anterior usaba `prov[:3].upper()`, que produce duplicados ("SAN" para Santa Elena y Santo Domingo → unique violation).
- **`db/seeds/06_mediciones_demo.sql` es el que hace computable el INGEL:** genera 11.664 mediciones deterministas (243 GAD × 16 indicadores × 3 años) y recalcula `scoring` en SQL puro con las mismas ponderaciones que Python/JS. Sin este seed, la tabla `mediciones` queda vacía y el motor produce INGEL nulo. En producción lo reemplaza el ETL/scraper; en dev/demo es el que llena rankings, evolución histórica y estadísticas.

## Gotchas del repo

- **`.gitignore` con reglas amplias:** el patrón Python `lib/` sin ancla silenciosamente ignoraba `sigel/apps/web/src/lib/` — `api.ts` (cliente HTTP de todo el frontend) nunca se commiteaba y cualquier `pnpm build` fallaba con "Cannot find module '@/lib/api'". Las reglas de build de un servicio deben anclarse con `/` inicial (p.ej. `/lib/`, `**/site-packages/lib/`). Antes de commitear, verifica con `git check-ignore <ruta>` cualquier regla que use nombres genéricos de directorio.
- **Workflows Pages colisionantes:** GitHub añade `nextjs.yml` automáticamente al habilitar Pages en un repo con Next.js detectado (aunque el Next.js real esté en `sigel/apps/web/` y no sea lo que se despliega). Comparte `concurrency: pages` con `pages.yml` y provoca race. El workflow oficial es `.github/workflows/pages.yml` (raíz, publica solo `sigel-public/`); si aparece `nextjs.yml`, bórralo.
