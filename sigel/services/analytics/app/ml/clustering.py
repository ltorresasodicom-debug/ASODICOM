"""Clustering territorial K-Means.

Variables (§1.12): población, presupuesto, ruralidad, densidad, pobreza.
Produce clústeres: metropolitanos / intermedios / rurales / amazónicos / turísticos.
"""
from __future__ import annotations

from datetime import date

import numpy as np
import pandas as pd
import structlog
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()

CLUSTERS_DEF = [
    ("METROPOLITANO", "Cantones con >500 mil habitantes"),
    ("INTERMEDIO",    "Cantones de 100k a 500k habitantes"),
    ("PEQUENO",       "Cantones <100k habitantes con baja ruralidad"),
    ("RURAL_DISPERSO","Cantones de baja densidad y alta ruralidad"),
    ("AMAZONICO",     "Cantones de la región amazónica"),
]


async def recalcular_clusters(db: AsyncSession, k: int = 5) -> int:
    """Recalcula la asignación de clústeres a todos los cantones."""
    rows = (
        await db.execute(
            text(
                """
                SELECT c.id,
                       COALESCE(c.poblacion,0)      AS pob,
                       COALESCE(c.superficie_km2,0) AS sup,
                       COALESCE(c.densidad,0)       AS den,
                       COALESCE(c.ruralidad_pct,0)  AS rur,
                       COALESCE(c.indice_pobreza,0) AS pob_idx,
                       COALESCE(c.presupuesto,0)    AS pres,
                       r.codigo AS region
                FROM sigel.cantones c
                LEFT JOIN sigel.provincias p ON p.id = c.provincia_id
                LEFT JOIN sigel.regiones r ON r.id = p.region_id
                """
            )
        )
    ).all()
    if len(rows) < k:
        return 0

    df = pd.DataFrame(rows, columns=["canton_id", "pob", "sup", "den", "rur", "pob_idx", "pres", "region"])
    features = df[["pob", "sup", "den", "rur", "pob_idx", "pres"]].fillna(0).values
    X = StandardScaler().fit_transform(features)

    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    # Heurística simple: ordena clústeres por población media descendiente para mapear a categoría
    cluster_pop = pd.DataFrame({"label": labels, "pob": df["pob"]}).groupby("label").mean()
    sorted_clusters = cluster_pop.sort_values("pob", ascending=False).index.tolist()
    label_to_codigo = {l: CLUSTERS_DEF[i % len(CLUSTERS_DEF)][0] for i, l in enumerate(sorted_clusters)}

    # Limpiar clústeres anteriores
    await db.execute(text("DELETE FROM sigel.gad_cluster WHERE fecha_asignacion = :f"), {"f": date.today()})

    # Insertar definiciones (idempotente)
    for codigo, desc in CLUSTERS_DEF:
        await db.execute(
            text(
                """INSERT INTO sigel.clusters_territoriales (nombre, descripcion, version_algoritmo)
                   VALUES (:n, :d, '1.0.0')
                   ON CONFLICT DO NOTHING"""
            ),
            {"n": codigo, "d": desc},
        )

    actualizados = 0
    for canton_id, label in zip(df["canton_id"], labels, strict=False):
        codigo = label_to_codigo[label]
        await db.execute(
            text("UPDATE sigel.cantones SET categoria = :c WHERE id = :id"),
            {"c": codigo, "id": int(canton_id)},
        )
        actualizados += 1

    await db.commit()
    logger.info("clustering.recalculado", cantones=actualizados, k=k)
    return actualizados
