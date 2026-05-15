'use client';
import { Settings, Database, Users, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiSigel } from '@/lib/api';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display font-bold text-3xl flex items-center gap-3">
          <Settings className="w-8 h-8" /> Panel Administrativo
        </h1>
        <p className="text-slate-600">Acceso restringido a roles ADMIN y ANALISTA.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card icon={Database} title="Catálogo de indicadores" desc="Gestionar dimensiones, variables, indicadores y ponderaciones." />
        <Card icon={Users} title="Usuarios y roles" desc="CRUD de usuarios, asignación de permisos RBAC." />
        <Card icon={BarChart3} title="Recálculo de scoring" desc="Disparar recálculo masivo del INGEL para todos los GADs." action={() => apiSigel.rankingNacional()} />
        <Card icon={AlertTriangle} title="Gestión de alertas" desc="Revisar y resolver alertas activas." />
        <Card icon={RefreshCw} title="Pipelines ETL" desc="Disparar spiders (LOTAIP, SERCOP, Finanzas, INEC) bajo demanda." />
        <Card icon={Settings} title="Configuración del modelo" desc="Ajustar pesos de dimensiones y umbrales de alertas." />
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, desc, action }: any) {
  return (
    <button onClick={action} className="card text-left hover:shadow-floating transition">
      <Icon className="w-6 h-6 text-sigel-primary mb-2" />
      <div className="font-display font-semibold">{title}</div>
      <div className="text-sm text-slate-600 mt-1">{desc}</div>
    </button>
  );
}
