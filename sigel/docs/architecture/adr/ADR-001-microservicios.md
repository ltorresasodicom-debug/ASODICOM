# ADR-001 — Arquitectura de microservicios

**Estado:** Aceptada
**Fecha:** 2025-01-15
**Contexto:** decisión inicial de arquitectura

## Decisión

Adoptar arquitectura de microservicios con dos stacks principales:
- **Node.js / NestJS** para el gateway (API REST + GraphQL, auth, validación,
  cache, BFF para el frontend).
- **Python / FastAPI** para el motor analítico, ML y NLP.

El frontend es **Next.js 14 (App Router)** consumiendo el gateway.

## Alternativas evaluadas

1. **Monolito Django/Rails** — descartado por dificultad para escalar el motor
   analítico independientemente y por mezclar lógica de orquestación con ML.
2. **Monolito NestJS con `nestjs-pytools`** — descartado: Python ML necesita
   pandas/scikit-learn/scipy, mejor en proceso separado.
3. **Microservicios todos en Go** — descartado: ecosistema ML en Go inmaduro
   comparado con Python.

## Consecuencias

✅ Cada servicio escala independientemente (gateway 3-20 réplicas, analytics 2-10).
✅ El equipo puede trabajar en paralelo (frontend/backend/data).
✅ Cada stack usa su mejor herramienta (NestJS DI/RBAC; FastAPI + scikit-learn).
⚠ Aumenta complejidad operacional → mitigado con Docker Compose + Kustomize.
⚠ Latencia adicional entre servicios → mitigado con Redis cache.
