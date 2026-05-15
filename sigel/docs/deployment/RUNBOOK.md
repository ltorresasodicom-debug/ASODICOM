# SIGEL — Runbook de Despliegue

## 1. Entornos

| Entorno     | URL                          | Branch     | Tag         | Réplicas |
|-------------|------------------------------|------------|-------------|----------|
| **Dev**     | localhost                    | cualquier  | dev / SHA   | 1×       |
| **Staging** | https://staging.sigel.gob.ec | `develop`  | latest      | 1–2×     |
| **Prod**    | https://sigel.gob.ec         | `main`+tag | v1.x.y      | 3–20×    |

---

## 2. Despliegue local

```bash
./scripts/bootstrap.sh
```

Equivalente a:
```bash
cp .env.example .env
docker compose build --parallel
docker compose up -d
```

**Verificación:**
```bash
curl -fsS http://localhost:3000/health
curl -fsS http://localhost:8000/health
curl -fsS http://localhost:8001/health
curl -fsS http://localhost:4000 | head
```

---

## 3. Despliegue Kubernetes (staging)

### Pre-requisitos
- Cluster K8s (EKS, GKE, AKS o k3s).
- `kubectl` configurado.
- Ingress NGINX instalado.
- Cert-manager con issuer `letsencrypt-prod`.
- Secrets creados:
  ```bash
  kubectl -n sigel-staging create secret generic postgres-secret \
      --from-literal=user=sigel --from-literal=password=<PROD_PASS>
  kubectl -n sigel-staging create secret generic gateway-secret \
      --from-literal=jwt=<32+ random chars>
  kubectl -n sigel-staging create secret generic mongo-secret \
      --from-literal=user=sigel --from-literal=password=<PROD_PASS>
  ```

### Aplicar
```bash
kubectl apply -k infra/k8s/overlays/staging
kubectl -n sigel-staging rollout status deploy/stg-gateway
kubectl -n sigel-staging rollout status deploy/stg-analytics
kubectl -n sigel-staging rollout status deploy/stg-web
```

### Verificación
```bash
kubectl -n sigel-staging get pods,svc,ingress
curl -fsS https://staging.sigel.gob.ec/health
```

---

## 4. Despliegue producción

**Solo desde tags semánticos** (`v1.2.3`). El pipeline `deploy-prod.yml`:

1. Construye imágenes multi-arch y las publica en GHCR.
2. Aplica `infra/k8s/overlays/prod`.
3. Espera rollout completo.
4. Ejecuta smoke test contra `/api/v1/scoring/estadisticas`.

**Rollback rápido:**
```bash
kubectl -n sigel rollout undo deploy/gateway
kubectl -n sigel rollout undo deploy/analytics
kubectl -n sigel rollout undo deploy/web
```

---

## 5. Operaciones comunes

| Tarea                                  | Comando                                                                                |
|----------------------------------------|----------------------------------------------------------------------------------------|
| Recalcular INGEL para todos los GADs   | `curl -X POST http://analytics:8000/api/v1/scoring/calcular/batch`                     |
| Ejecutar spider LOTAIP                 | `kubectl -n sigel create job --from=cronjob/scraper-lotaip lotaip-manual`              |
| Recargar clústeres K-Means             | `curl -X POST http://analytics:8000/api/v1/clustering/recalcular`                      |
| Detectar anomalías                     | `curl -X POST http://analytics:8000/api/v1/anomalias/detectar`                         |
| Entrenar Random Forest                 | `curl -X POST http://analytics:8000/api/v1/predict/entrenar`                           |
| Ver logs del gateway                   | `kubectl -n sigel logs -f deploy/gateway`                                              |
| Conectar a la BD                       | `kubectl -n sigel exec -it postgres-0 -- psql -U sigel sigel`                          |

---

## 6. Backup & Restore

### PostgreSQL
- **Backup diario** con pg_dump → S3 (CronJob).
- **Retención:** 90 días.
- **Restore:**
  ```bash
  kubectl -n sigel cp postgres-0:/tmp/backup.dump .
  pg_restore -h <host> -U sigel -d sigel backup.dump
  ```

### MongoDB
- `mongodump --uri ... --out /backup`
- Retención 30 días.

---

## 7. Monitoreo & SLA

| Métrica                     | SLO    | Alerta          |
|-----------------------------|--------|------------------|
| Disponibilidad gateway      | 99.9%  | <99.5% → P1     |
| p95 latencia ranking        | <300ms | >500ms → P2     |
| Errores 5xx gateway         | <0.1%  | >1% → P1        |
| Ejecución diaria scraper    | OK     | fallo → P2      |
| Lag de scoring (días)       | <2     | >5 → P3         |

Dashboards en Grafana: `https://sigel.gob.ec/metrics-ui/`.
