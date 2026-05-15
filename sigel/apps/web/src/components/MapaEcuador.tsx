'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { apiSigel, ScoringRanking } from '@/lib/api';

const COLOR_SEMAFORO = { VERDE: '#16A34A', AMARILLO: '#F59E0B', ROJO: '#DC2626' };

// Coordenadas aproximadas de las capitales provinciales del Ecuador.
const CAPITALES: Record<string, [number, number]> = {
  Azuay: [-2.9, -78.95], Bolivar: [-1.6, -79.0], Cañar: [-2.7, -78.95],
  Carchi: [0.81, -77.72], Cotopaxi: [-0.93, -78.62], Chimborazo: [-1.66, -78.65],
  'El Oro': [-3.27, -79.96], Esmeraldas: [0.96, -79.65], Guayas: [-2.19, -79.88],
  Imbabura: [0.35, -78.13], Loja: [-3.99, -79.20], 'Los Rios': [-1.5, -79.5],
  Manabi: [-1.05, -80.45], 'Morona Santiago': [-2.31, -78.12], Napo: [-0.92, -77.81],
  Pastaza: [-1.49, -77.99], Pichincha: [-0.22, -78.51], Tungurahua: [-1.25, -78.62],
  'Zamora Chinchipe': [-4.07, -78.95], Galapagos: [-0.9, -90.95],
  Sucumbios: [0.08, -76.88], Orellana: [-0.46, -76.99],
  'Santo Domingo de los Tsachilas': [-0.25, -79.17], 'Santa Elena': [-2.23, -80.86],
};

export default function MapaEcuador() {
  const { data } = useQuery({
    queryKey: ['ranking-mapa'],
    queryFn: () => apiSigel.rankingNacional(500, 0),
  });

  return (
    <MapContainer
      center={[-1.5, -78.5]}
      zoom={6}
      minZoom={5}
      maxZoom={12}
      style={{ height: 600, width: '100%' }}
      scrollWheelZoom={true}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Carto Light">
          <TileLayer
            attribution='&copy; CartoDB'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {(data ?? []).map((row) => {
        const coord = CAPITALES[row.provincia];
        if (!coord) return null;
        return (
          <CircleMarker
            key={row.gad_id}
            center={coord}
            radius={Math.max(6, row.ingel / 10)}
            pathOptions={{
              color: COLOR_SEMAFORO[row.semaforo] ?? '#94A3B8',
              fillOpacity: 0.65,
              weight: 2,
            }}
          >
            <Tooltip>
              <div className="text-xs">
                <div className="font-bold">{row.gad_nombre}</div>
                <div>INGEL: <strong>{Number(row.ingel).toFixed(1)}</strong></div>
                <div>Nivel: {row.nivel_desempeno}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
