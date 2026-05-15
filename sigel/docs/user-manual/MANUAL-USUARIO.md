# SIGEL — Manual de Usuario

## ¿Qué es SIGEL?

SIGEL (Sistema Integral de Gestión y Evaluación Local) es una plataforma
pública del Ecuador que **evalúa la gestión de tu alcalde y prefecto**
mediante un puntaje único, el **INGEL** (Índice Nacional de Gestión Local).

El puntaje va de **0 a 100** y se calcula combinando:

- **Datos oficiales** (60 %) — presupuestos, contratación pública,
  transparencia.
- **Tu opinión ciudadana** (25 %) — encuestas mensuales.
- **Análisis experto** (15 %) — paneles técnicos.

---

## ¿Cómo se interpreta el puntaje?

| Puntaje | Nivel     | Significado                                       | Color   |
|---------|-----------|---------------------------------------------------|---------|
| 90–100  | EXCELENTE | Referente nacional                                | 🟢 Verde |
| 75–89   | ALTO      | Buena gestión                                     | 🟢 Verde |
| 60–74   | MEDIO     | Hay aspectos por mejorar                          | 🟡 Amarillo |
| 40–59   | BAJO      | Riesgos institucionales identificados             | 🔴 Rojo  |
| 0–39    | CRÍTICO   | Requiere intervención inmediata                   | 🔴 Rojo  |

---

## ¿Qué puedes hacer en la plataforma?

### 1. Consultar el ranking nacional → `/ranking`

Tabla con los 241 GAD (218 cantones + 23 prefecturas) ordenados de mejor
a peor según el INGEL. Filtra por tipo (municipal/provincial) o busca
un GAD por nombre.

### 2. Explorar el mapa → `/mapa`

Mapa de Ecuador con coropletas por INGEL. Pasa el cursor sobre cada
provincia para ver el detalle.

### 3. Conocer tu autoridad → `/autoridad/{id}`

Ficha completa: perfil multidimensional (radar de 8 dimensiones),
evolución histórica, sub-índices, indicadores objetivos y percepción
ciudadana acumulada.

### 4. Responder encuestas → `/encuestas`

Tu voz cuenta el 25 % del INGEL. Cada pregunta usa una escala Likert 1–5
("Muy malo" a "Muy bueno") en 6 bloques:

1. Información general
2. Confianza institucional
3. Calidad de servicios
4. Participación ciudadana
5. Transparencia digital
6. Evaluación general

Las respuestas son **anónimas**; sólo se almacena un hash IP para
prevenir duplicados.

### 5. Denunciar → `/denuncias`

Reporta irregularidades de forma **anónima** o registrada:

- Selecciona el GAD a denunciar.
- Elige el tipo (corrupción, opacidad, mal servicio, etc.).
- Describe los hechos.
- Recibirás un código `SIGEL-XXXXXXXX` para hacer seguimiento.

### 6. Acceder a documentos → `/transparencia`

Buscador full-text sobre los documentos oficiales recolectados
automáticamente: presupuestos, PDOTs, informes LOTAIP, contratación
pública.

---

## Preguntas frecuentes

**¿Mis datos se comparten con el GAD evaluado?**
No. Las respuestas se anonimizan antes del cálculo del scoring.

**¿Con qué frecuencia se actualiza el INGEL?**
- Diariamente para los componentes de transparencia y finanzas.
- Mensualmente para encuestas ciudadanas.
- Trimestralmente para análisis experto.

**¿Quién decide la metodología?**
Un Consejo Técnico Nacional con representantes de universidades,
observatorios, sociedad civil y organismos multilaterales (§21 de la
metodología).

**¿Puedo descargar los datos?**
Sí. Todos los datos son abiertos bajo licencia **CC-BY 4.0**. Disponibles
vía la API REST (`/api/v1/...`) y exportables desde el panel ciudadano.
