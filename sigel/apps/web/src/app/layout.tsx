import type { Metadata } from 'next';
import './../styles/globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SIGEL — Sistema Integral de Gestión y Evaluación Local',
  description:
    'Plataforma nacional de evaluación pública de alcaldes y prefectos del Ecuador. Transparencia, eficacia, calidad de servicios, participación ciudadana e innovación digital.',
  keywords: ['SIGEL', 'Ecuador', 'alcaldes', 'prefectos', 'transparencia', 'GovTech', 'INGEL'],
  openGraph: {
    title: 'SIGEL Ecuador',
    description: 'Evaluación nacional de gobiernos locales',
    locale: 'es_EC',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
