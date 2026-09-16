import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Check,
  Star,
  ThumbsUp,
  Layers,
  Accessibility,
  Globe2,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { AcessibilidadeAvaliacao, MapaNacionalData, EstadoRanking } from '../types.js';
import { buscarLocaisMapa, buscarMapaNacional } from '../services/api.js';
import { MapFilters } from './map/MapFilters.js';

interface MapaAcessivelProps {
  initialLat?: number;
  initialLon?: number;
  onSelectCep?: (cep: string) => void;
  onUpvote?: (id: string) => Promise<void>;
}

export const MapaAcessivel: React.FC<MapaAcessivelProps> = ({
  initialLat = -23.561492,
  initialLon = -46.655881,
  onSelectCep,
  onUpvote,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Mode: 'local' (raio a partir de um ponto) vs 'nacional' (todo o Brasil com ranking)
  const [viewMode, setViewMode] = useState<'local' | 'nacional'>('nacional');

  const [center, setCenter] = useState<{ lat: number; lon: number }>({
    lat: initialLat,
    lon: initialLon,
  });
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [filterRampa, setFilterRampa] = useState<boolean>(false);
  const [filterElevador, setFilterElevador] = useState<boolean>(false);
  const [filterBanheiro, setFilterBanheiro] = useState<boolean>(false);
  const [filterVaga, setFilterVaga] = useState<boolean>(false);
  const [filterPisoTatil, setFilterPisoTatil] = useState<boolean>(false);
  const [filterLibras, setFilterLibras] = useState<boolean>(false);
  const [filterSonoro, setFilterSonoro] = useState<boolean>(false);
  const [filterEspacoCalmo, setFilterEspacoCalmo] = useState<boolean>(false);
  const [locais, setLocais] = useState<(AcessibilidadeAvaliacao & { distanceKm?: number })[]>([]);
  const [nacionalData, setNacionalData] = useState<MapaNacionalData | null>(null);
  const [selectedUf, setSelectedUf] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLocal, setSelectedLocal] = useState<AcessibilidadeAvaliacao | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Começa com visão do Brasil
      const map = L.map(mapContainerRef.current, {
        center: [-14.235, -51.9253], // Centro geográfico do Brasil
        zoom: 4,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch locations according to mode
  const loadData = async () => {
    try {
      setLoading(true);
      if (viewMode === 'nacional') {
        const data = await buscarMapaNacional();
        setNacionalData(data);
        setLocais(data.locais);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([-14.235, -51.9253], 4, { animate: true });
        }
      } else {
        const data = await buscarLocaisMapa(center.lat, center.lon, radiusKm);
        setLocais(data);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([center.lat, center.lon], 13, { animate: true });
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do mapa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewMode, center.lat, center.lon, radiusKm]);

  // Filtered locations across all accessibility criteria and selected UF
  const filteredLocais = locais.filter((l) => {
    if (selectedUf && l.uf?.toUpperCase() !== selectedUf.toUpperCase()) return false;
    if (filterRampa && !l.rampa_acesso) return false;
    if (filterElevador && !l.elevador) return false;
    if (filterBanheiro && !l.banheiro_adaptado) return false;
    if (filterVaga && !l.vaga_pcd) return false;
    if (filterPisoTatil && !l.piso_tatil) return false;
    if (filterLibras && !l.interprete_libras) return false;
    if (filterSonoro && !l.sinalizacao_sonora) return false;
    if (filterEspacoCalmo && !l.espaco_calmo) return false;
    return true;
  });

  // Render markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredLocais.forEach((loc) => {
      const isHighQuality = loc.nota_facilidade >= 4;
      const markerHtml = `
        <div style="
          background: ${isHighQuality ? '#10b981' : '#667eea'};
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2.5px solid white;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          ♿
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -32],
      });

      const lat = loc.lat || center.lat;
      const lon = loc.lon || center.lon;

      const marker = L.marker([lat, lon], {
        icon: customIcon,
      });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <h4 style="margin: 0; font-weight: 800; color: #0f172a; font-size: 14px;">${loc.local_nome}</h4>
            <span style="background: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; border: 1px solid #a7f3d0;">
              ${loc.uf}
            </span>
          </div>
          <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">CEP: ${loc.cep} • ${loc.cidade}-${loc.uf}</p>
          <div style="margin-bottom: 6px; font-weight: 700; color: #059669; font-size: 12px;">
            ★ ${loc.nota_facilidade}.0 • ${loc.upvotes} confirmações comunitárias
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px; display: flex; flex-wrap: wrap; gap: 3px;">
            ${loc.rampa_acesso ? '<span style="background:#f0fdf4; border:1px solid #bbf7d0; padding:1px 5px; border-radius:4px;">♿ Rampa</span>' : ''}
            ${loc.elevador ? '<span style="background:#f0fdf4; border:1px solid #bbf7d0; padding:1px 5px; border-radius:4px;">🛗 Elevador</span>' : ''}
            ${loc.banheiro_adaptado ? '<span style="background:#f0fdf4; border:1px solid #bbf7d0; padding:1px 5px; border-radius:4px;">🚻 Banheiro PCD</span>' : ''}
            ${loc.piso_tatil ? '<span style="background:#eef2ff; border:1px solid #c7d2fe; padding:1px 5px; border-radius:4px;">🦯 Tátil</span>' : ''}
            ${loc.interprete_libras ? '<span style="background:#eef2ff; border:1px solid #c7d2fe; padding:1px 5px; border-radius:4px;">🧏 Libras</span>' : ''}
            ${loc.espaco_calmo ? '<span style="background:#eef2ff; border:1px solid #c7d2fe; padding:1px 5px; border-radius:4px;">🧠 TEA</span>' : ''}
          </div>
          <p style="font-size: 11px; font-style: italic; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">"${loc.comentario}"</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedLocal(loc);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredLocais]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setCenter(newPos);
          setViewMode('local');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([newPos.lat, newPos.lon], 14, { animate: true });
          }
        },
        (err) => {
          console.warn('Geolocalização não permitida:', err);
        }
      );
    }
  };

  const handleFocusBrasil = () => {
    setViewMode('nacional');
    setSelectedUf(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-14.235, -51.9253], 4, { animate: true });
    }
  };

  const handleSelectEstado = (uf: string) => {
    if (selectedUf === uf) {
      setSelectedUf(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([-14.235, -51.9253], 4, { animate: true });
      }
      return;
    }

    setSelectedUf(uf);
    // Localizar primeiro local do estado selecionado para dar zoom
    const primeiroDoEstado = locais.find((l) => l.uf?.toUpperCase() === uf.toUpperCase());
    if (primeiroDoEstado && mapInstanceRef.current && primeiroDoEstado.lat && primeiroDoEstado.lon) {
      mapInstanceRef.current.setView([primeiroDoEstado.lat, primeiroDoEstado.lon], 11, { animate: true });
    }
  };

  const handleSelectLocalInList = (loc: AcessibilidadeAvaliacao) => {
    setSelectedLocal(loc);
    if (mapInstanceRef.current && loc.lat && loc.lon) {
      mapInstanceRef.current.setView([loc.lat, loc.lon], 15, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Base Nacional de Acessibilidade Urbana</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full font-mono border border-emerald-300/80">
                  {locais.length} pontos no Brasil
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Visualize todo o mapa do Brasil com pontos mapeados e descubra onde há maior infraestrutura de acessibilidade
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Nacional vs Local */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={handleFocusBrasil}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all text-xs font-bold cursor-pointer ${
                  viewMode === 'nacional'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Mapa do Brasil</span>
              </button>

              <button
                onClick={() => setViewMode('local')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all text-xs font-bold cursor-pointer ${
                  viewMode === 'local'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Modo Raio Local</span>
              </button>
            </div>

            {viewMode === 'local' && (
              <>
                <button
                  onClick={handleUseMyLocation}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100/80 active:scale-95 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Minha Localização</span>
                </button>

                <div className="flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/80 text-xs font-semibold">
                  <span className="pl-3 pr-1 text-[11px] text-slate-400 font-medium">Raio:</span>
                  {[10, 25, 50, 100].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadiusKm(r)}
                      className={`px-3 py-1.5 rounded-full transition-all text-xs font-bold cursor-pointer ${
                        radiusKm === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Estatísticas Nacionais: Onde tem mais acessibilidade no Brasil */}
        {nacionalData && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Ranking de Acessibilidade por Estado (Clique para filtrar no Mapa):</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Média Nacional: <strong className="text-emerald-700 font-bold font-mono">★ {nacionalData.mediaNacional}.0</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedUf(null)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  selectedUf === null
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Todos os Estados ({nacionalData.totalLocais})
              </button>

              {nacionalData.rankingEstados.map((item, idx) => (
                <button
                  key={item.uf}
                  onClick={() => handleSelectEstado(item.uf)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedUf === item.uf
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <span className="text-[10px] font-mono opacity-80">#{idx + 1}</span>
                  <span className="font-extrabold">{item.uf}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedUf === item.uf ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    ★ {item.mediaNota} ({item.total})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <MapFilters
          filteredCount={filteredLocais.length}
          selectedUf={selectedUf}
          filters={[
            { key: 'rampa', label: '♿ Rampa', active: filterRampa, tone: 'green', onToggle: () => setFilterRampa(!filterRampa) },
            { key: 'elevador', label: '🛗 Elevador', active: filterElevador, tone: 'green', onToggle: () => setFilterElevador(!filterElevador) },
            { key: 'banheiro', label: '🚻 Banheiro PCD', active: filterBanheiro, tone: 'green', onToggle: () => setFilterBanheiro(!filterBanheiro) },
            { key: 'vaga', label: '🅿️ Vaga PCD', active: filterVaga, tone: 'green', onToggle: () => setFilterVaga(!filterVaga) },
            { key: 'piso-tatil', label: '🦯 Piso Tátil', active: filterPisoTatil, tone: 'indigo', onToggle: () => setFilterPisoTatil(!filterPisoTatil) },
            { key: 'libras', label: '🧏 Libras', active: filterLibras, tone: 'indigo', onToggle: () => setFilterLibras(!filterLibras) },
            { key: 'sonoro', label: '🔊 Sinal Sonoro', active: filterSonoro, tone: 'indigo', onToggle: () => setFilterSonoro(!filterSonoro) },
            { key: 'espaco-calmo', label: '🧠 Espaço Calmo', active: filterEspacoCalmo, tone: 'indigo', onToggle: () => setFilterEspacoCalmo(!filterEspacoCalmo) },
          ]}
        />
      </div>

      {/* Map + List layout - Responsive for mobile & tablets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leaflet Map Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden h-105 sm:h-137.5 relative">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {viewMode === 'nacional' ? 'Visão Panorâmica: Brasil Inteiro' : `Raio de ${radiusKm} km`}
              {selectedUf ? ` • Filtrado por: ${selectedUf}` : ''}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-[11px] font-medium shadow-md flex items-center gap-2">
            <span>🟢 Verde: Nota 4.0 - 5.0 (Excelente Acessibilidade)</span>
            <span>•</span>
            <span>🟣 Roxo: Nota 3.0 (Parcial)</span>
          </div>
        </div>

        {/* Sidebar with List of places & Regional Highlights */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-6 h-120 sm:h-137.5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>
                {viewMode === 'nacional'
                  ? selectedUf ? `Locais Mapeados em ${selectedUf}` : 'Pontos Mapeados no Brasil'
                  : `Locais no Raio de ${radiusKm} km`}
              </span>
              <span className="text-xs font-medium text-slate-400">Toque para focar</span>
            </h3>

            <div className="overflow-y-auto max-h-100 sm:max-h-112.5 space-y-2.5 mt-3 pr-1 no-scrollbar">
              {filteredLocais.length === 0 ? (
                <div className="text-center py-14 text-slate-400 text-xs leading-relaxed">
                  Nenhum local atende aos filtros selecionados. Tente limpar os filtros ou selecionar outro estado.
                </div>
              ) : (
                filteredLocais.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocalInList(item)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      selectedLocal?.id === item.id
                        ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200/70 shadow-xs'
                        : 'bg-slate-50/50 hover:bg-white border-slate-200/80 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.local_nome}</h4>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded-sm mr-1">
                          {item.uf}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.cidade} • {item.bairro}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-mono">
                        ★ {item.nota_facilidade}.0
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      CEP: {item.cep} {item.distanceKm ? `(${item.distanceKm} km)` : ''}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.rampa_acesso && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
                          ♿ Rampa
                        </span>
                      )}
                      {item.elevador && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
                          🛗 Elevador
                        </span>
                      )}
                      {item.banheiro_adaptado && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
                          🚻 Banheiro PCD
                        </span>
                      )}
                      {item.piso_tatil && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded-full font-semibold">
                          🦯 Tátil
                        </span>
                      )}
                      {item.interprete_libras && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded-full font-semibold">
                          🧏 Libras
                        </span>
                      )}
                      {item.espaco_calmo && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded-full font-semibold">
                          🧠 TEA
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        {item.upvotes} confirmações
                      </span>
                      {onSelectCep && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCep(item.cep);
                          }}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          Ver CEP →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

