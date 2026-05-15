# SIGEL — Wireframes principales

Wireframes ASCII de las pantallas críticas. La implementación visual se
encuentra en `apps/web/src/app/`.

## 1. Dashboard nacional (`/dashboard`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [🛡 SIGEL ECUADOR EVALÚA]   [Dashboard│Ranking│Mapa│Encuestas│Denuncias] │
├────────────────────────────────────────────────────────────────────────┤
│  Dashboard Nacional SIGEL                                              │
│  Métricas agregadas del INGEL — actualizadas en tiempo real            │
│                                                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ │
│ │ 🏢 241       │ │ 📊 71.4      │ │ 📈 92.1      │ │ ⚠ 18           │ │
│ │ GADs eval.   │ │ INGEL prom.  │ │ Máx INGEL    │ │ GADs en rojo   │ │
│ │ 218m · 23p   │ │ σ ±10.3      │ │ Mín 42.1     │ │ Intervención   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────┐  ┌─────────────────────────────────┐ │
│ │ TOP 10 GADs por INGEL        │  │ Distribución semaforización     │ │
│ │ [Cuenca         ▰▰▰▰▰ 92]    │  │      ┌──────────┐               │ │
│ │ [Quito          ▰▰▰▰  85]    │  │      │ █ Verde 142│              │ │
│ │ [Guayaquil      ▰▰▰▰  81]    │  │      │ █ Amarillo 81│            │ │
│ │ [Loja           ▰▰▰▰  79]    │  │      │ █ Rojo 18  │              │ │
│ │  ...                         │  │      └──────────┘               │ │
│ └──────────────────────────────┘  └─────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Ranking (`/ranking`)

```
┌────────────────────────────────────────────────────────────────────────┐
│  Ranking Nacional INGEL                                                │
│  ┌────────────────────────┐  [Todos|Municipal|Provincial]              │
│  │ 🔍 Buscar GAD...       │                                            │
│  └────────────────────────┘                                            │
│  ┌─────┬─────────────────────┬────────┬──────────┬──────┬──────┬────┐ │
│  │  #  │ GAD                 │ Tipo   │ Provincia│ INGEL│Nivel │ ⬤ │ │
│  ├─────┼─────────────────────┼────────┼──────────┼──────┼──────┼────┤ │
│  │  1  │ GAD Cuenca          │ Munic. │ Azuay    │ 92.1 │EXCEL │🟢  │ │
│  │  2  │ GAD Quito           │ Munic. │ Pichincha│ 85.4 │ALTO  │🟢  │ │
│  │  3  │ Prefectura Pichincha│ Prov.  │ Pichincha│ 81.7 │ALTO  │🟢  │ │
│  │ ... │                     │        │          │      │      │    │ │
│  └─────┴─────────────────────┴────────┴──────────┴──────┴──────┴────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## 3. Mapa interactivo (`/mapa`)

```
┌────────────────────────────────────────────────────────────────────────┐
│  Mapa Nacional de Desempeño                                            │
│  Capas: [INGEL ▼] [Transparencia] [Servicios] [Participación]          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │           ◉ Esmeraldas                                           │ │
│  │              ◉ Carchi                                            │ │
│  │        ◉ Manabí    ◉ Pichincha [Quito 85]                       │ │
│  │                       ◉ Cotopaxi                                 │ │
│  │       ◉ Guayas        ◉ Tungurahua                               │ │
│  │   [Guayaquil 81]    ◉ Chimborazo                                 │ │
│  │            ◉ Cañar    ◉ Azuay [Cuenca 92]                       │ │
│  │                  ◉ Loja                                          │ │
│  │                                                                  │ │
│  │       Leaflet + OpenStreetMap                                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  Leyenda:  🟢 alto    🟡 medio    🔴 crítico                           │
└────────────────────────────────────────────────────────────────────────┘
```

## 4. Encuesta ciudadana (`/encuestas`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📢 Encuesta Ciudadana SIGEL                                            │
│ Tu evaluación es anónima y constituye el 25 % del INGEL.               │
│                                                                        │
│ Pregunta 1 de 6:                                                       │
│ ¿Confía usted en la gestión de su alcalde/prefecto?                    │
│ ┌────────┬────────┬────────┬────────┬────────┐                         │
│ │   1    │   2    │   3    │   4    │   5    │                         │
│ │Muy malo│ Malo   │Regular │ Bueno  │Muy bueno│                        │
│ └────────┴────────┴────────┴────────┴────────┘                         │
│                                                                        │
│ [Anterior]                            [Siguiente →]                    │
└────────────────────────────────────────────────────────────────────────┘
```

## 5. Ficha de autoridad (`/autoridad/[id]`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ GAD Municipal de Cuenca                  INGEL ──────────  92.1  🟢   │
│ Municipal · Azuay                                                      │
│                                                                        │
│ ┌─── Perfil multidimensional ───┐  ┌─── Evolución histórica ───┐      │
│ │           Trans.              │  │ 100 ┤                      │      │
│ │       ╱─────╲                 │  │  90 ┤      ╱╲              │      │
│ │   Inn.       Fin.             │  │  80 ┤────╱  ╲────          │      │
│ │      ╲     ╱                  │  │  70 ┤  ╱      ╲╲           │      │
│ │   Leg.  ●  Serv.              │  │  60 ┤                      │      │
│ │      ╱     ╲                  │  │     └────────────────────  │      │
│ │   Part. — Desa.               │  │     2023 2024 2025         │      │
│ │           Gest.               │  │     ── INGEL ── Transp.    │      │
│ └───────────────────────────────┘  └────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

## 6. Denuncia ciudadana (`/denuncias`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠ Denuncias Ciudadanas                                                 │
│ ┌─[Crear denuncia]─[Seguimiento]─┐                                     │
│                                                                        │
│ GAD a denunciar (ID): [1____]                                          │
│ Tipo: [CORRUPCION ▼]                                                   │
│ Asunto: [_________________________________________________]            │
│ Descripción detallada:                                                 │
│ ┌──────────────────────────────────────────────────────────────────┐  │
│ │                                                                  │  │
│ │                                                                  │  │
│ └──────────────────────────────────────────────────────────────────┘  │
│ ☑ 🔒 Enviar de forma anónima                                          │
│ [Enviar denuncia]                                                      │
└────────────────────────────────────────────────────────────────────────┘
```
