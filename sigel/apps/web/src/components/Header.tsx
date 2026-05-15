import Link from 'next/link';
import { Shield, BarChart3, Map, Megaphone, AlertTriangle } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-sigel-primary text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-sigel-accent" />
          <div>
            <div className="font-display font-bold text-xl tracking-tight">SIGEL</div>
            <div className="text-[10px] uppercase tracking-widest opacity-80">Ecuador Evalúa</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-sigel-accent flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Dashboard</Link>
          <Link href="/ranking" className="hover:text-sigel-accent">Ranking</Link>
          <Link href="/mapa" className="hover:text-sigel-accent flex items-center gap-1"><Map className="w-4 h-4" /> Mapa</Link>
          <Link href="/transparencia" className="hover:text-sigel-accent">Transparencia</Link>
          <Link href="/encuestas" className="hover:text-sigel-accent flex items-center gap-1"><Megaphone className="w-4 h-4" /> Encuestas</Link>
          <Link href="/denuncias" className="hover:text-sigel-accent flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Denuncias</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-xs px-3 py-1.5 rounded border border-white/30 hover:bg-white/10">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
