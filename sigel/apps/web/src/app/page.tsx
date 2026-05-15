import Link from 'next/link';
import { Shield, BarChart3, Map, Megaphone, AlertTriangle, Building2, Users, FileSearch } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-sigel-primary via-blue-900 to-sigel-secondary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest opacity-80">
              Plataforma Nacional de Evaluación Pública
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight mt-3">
              Evaluamos la gestión local del Ecuador
            </h1>
            <p className="mt-5 text-lg opacity-90 max-w-xl">
              SIGEL mide el desempeño de <strong>23 prefectos</strong> y
              <strong> 218 alcaldes</strong> en 8 dimensiones —
              transparencia, finanzas, servicios, participación, innovación —
              y publica los resultados en tiempo real para fortalecer la
              rendición de cuentas y la mejora continua.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ranking" className="bg-sigel-accent hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                Ver ranking nacional
              </Link>
              <Link href="/mapa" className="bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-3 rounded-lg font-semibold">
                Explorar mapa
              </Link>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <Tile value="241" label="GADs evaluados" />
              <Tile value="8" label="Dimensiones" />
              <Tile value="100%" label="Datos abiertos" />
              <Tile value="24/7" label="Monitoreo IA" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl">
            Una sola plataforma. Toda la gestión local.
          </h2>
          <p className="text-slate-600 mt-3">
            Indicadores objetivos, percepción ciudadana y análisis experto
            convergen en el <strong>Índice Nacional de Gestión Local (INGEL)</strong>.
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
          <Feature icon={BarChart3} title="Ranking nacional" desc="Comparación entre los 218 GADs municipales y 23 provinciales." href="/ranking" />
          <Feature icon={Map}        title="Mapa interactivo" desc="Coropleta de desempeño territorial con semaforización." href="/mapa" />
          <Feature icon={FileSearch} title="Transparencia"    desc="Buscador de documentos LOTAIP, presupuestos y PDOTs." href="/transparencia" />
          <Feature icon={Megaphone}  title="Encuestas"        desc="Tu voz cuenta. Evalúa tu autoridad en 6 bloques." href="/encuestas" />
          <Feature icon={AlertTriangle} title="Denuncias"     desc="Reporta irregularidades de forma segura y anónima." href="/denuncias" />
          <Feature icon={Building2}  title="Fichas GAD"       desc="Perfil completo de cada cantón y prefectura." href="/ranking" />
          <Feature icon={Users}      title="Autoridades"      desc="Alcaldes, prefectos y asambleístas en un solo lugar." href="/ranking" />
          <Feature icon={Shield}     title="Auditoría IA"     desc="Detección automática de anomalías y riesgo institucional." href="/dashboard" />
        </div>
      </section>

      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-bold text-3xl">
              Metodología SIGEL: 8 dimensiones, 1 índice nacional.
            </h2>
            <p className="text-slate-300 mt-4">
              Fundamentada en ISO 18091, modelo Infoparticipa y Gobierno Abierto.
              Combina <strong>60% evaluación objetiva</strong> +
              <strong> 25% percepción ciudadana</strong> +
              <strong> 15% análisis experto</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Dim color="bg-teal-500" label="Transparencia" peso={20} />
            <Dim color="bg-blue-500" label="Finanzas" peso={15} />
            <Dim color="bg-purple-500" label="Servicios Públicos" peso={20} />
            <Dim color="bg-green-500" label="Desarrollo Territorial" peso={10} />
            <Dim color="bg-orange-500" label="Gestión Institucional" peso={10} />
            <Dim color="bg-red-500" label="Participación Ciudadana" peso={10} />
            <Dim color="bg-violet-500" label="Legitimidad" peso={10} />
            <Dim color="bg-cyan-500" label="Innovación Digital" peso={5} />
          </div>
        </div>
      </section>
    </>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-4 bg-white/10 rounded-xl">
      <div className="font-display font-bold text-3xl">{value}</div>
      <div className="text-xs opacity-80 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc, href }: any) {
  return (
    <Link href={href} className="card hover:shadow-floating transition group">
      <Icon className="w-7 h-7 text-sigel-primary mb-3 group-hover:scale-110 transition" />
      <h3 className="font-display font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </Link>
  );
}

function Dim({ color, label, peso }: { color: string; label: string; peso: number }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="flex-1">{label}</span>
      <span className="font-mono text-xs opacity-70">{peso}%</span>
    </div>
  );
}
