'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map, Marker, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by webpack bundling
// eslint-disable-next-line @typescript-eslint/no-require-imports
const L = require('leaflet') as typeof import('leaflet');
// @ts-expect-error leaflet icon default url resolution
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface LocationPickerMapProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

const DAKAR: [number, number] = [14.6937, -17.4441];

// Cadre approximatif de la région de Dakar (lon1,lat1,lon2,lat2) — utilisé pour
// prioriser les résultats de la zone sans exclure le reste du Sénégal.
const DAKAR_VIEWBOX = '-17.55,14.90,-17.10,14.60';

export function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const tileRef = useRef<TileLayer | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = lat != null && lng != null ? [lat, lng] : DAKAR;
    const zoom = lat != null && lng != null ? 15 : 12;

    const map = L.map(containerRef.current).setView(center, zoom);
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    if (lat != null && lng != null) {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        const m = L.marker([clickLat, clickLng], { draggable: true }).addTo(map);
        m.on('dragend', () => {
          const pos = m.getLatLng();
          onChange(pos.lat, pos.lng);
        });
        markerRef.current = m;
      }
      onChange(clickLat, clickLng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      // countrycodes=sn → uniquement le Sénégal (plus de résultats français).
      // viewbox + bounded=0 → priorise la région de Dakar tout en gardant
      // accessibles les autres villes sénégalaises (Thiès, Saint-Louis…).
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}` +
        `&limit=6&countrycodes=sn&viewbox=${DAKAR_VIEWBOX}&bounded=0`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } finally {
      setSearching(false);
    }
  }

  function handleSelectResult(result: NominatimResult) {
    const rlat = parseFloat(result.lat);
    const rlng = parseFloat(result.lon);
    if (!mapRef.current) return;
    mapRef.current.setView([rlat, rlng], 16);
    if (markerRef.current) {
      markerRef.current.setLatLng([rlat, rlng]);
    } else {
      const m = L.marker([rlat, rlng], { draggable: true }).addTo(mapRef.current);
      m.on('dragend', () => {
        const pos = m.getLatLng();
        onChange(pos.lat, pos.lng);
      });
      markerRef.current = m;
    }
    onChange(rlat, rlng);
    setResults([]);
    setQuery(result.display_name);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Rechercher une adresse…"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {searching ? '…' : 'Rechercher'}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="rounded-md border border-border bg-card shadow-md">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelectResult(r)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={containerRef}
        style={{ height: 350, width: '100%', borderRadius: 8, overflow: 'hidden' }}
        className="border border-border"
      />
      <p className="text-xs text-muted-foreground">
        Cliquez sur la carte pour placer le marqueur, ou faites-le glisser pour affiner.
      </p>
    </div>
  );
}
