export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-display font-bold text-white mb-3">SIGEL Ecuador</h4>
          <p className="opacity-80">
            Sistema Integral de Gestión y Evaluación Local. Plataforma nacional
            de transparencia y evaluación pública.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Plataforma</h4>
          <ul className="space-y-1 opacity-80">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/ranking">Ranking</a></li>
            <li><a href="/mapa">Mapa interactivo</a></li>
            <li><a href="/transparencia">Transparencia</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Metodología</h4>
          <ul className="space-y-1 opacity-80">
            <li>ISO 18091 — Gobiernos locales</li>
            <li>Modelo Infoparticipa</li>
            <li>LOTAIP & Gobierno Abierto</li>
            <li>PHVA — Mejora continua</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Estándares</h4>
          <ul className="space-y-1 opacity-80">
            <li>WCAG 2.1 AA</li>
            <li>OpenAPI 3.1</li>
            <li>Open Data CC-BY 4.0</li>
            <li>AGPL-3.0</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-700 py-4 text-center text-xs opacity-70">
        © 2025 SIGEL Ecuador — Evaluación pública para la mejora continua.
      </div>
    </footer>
  );
}
