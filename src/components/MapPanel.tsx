import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, LocateFixed, Maximize2, Minus, Plus, Satellite, Waves } from 'lucide-react';
import type { Village } from '../data';
import { cn } from '../lib/utils';
import { RISK, RISK_ORDER, pm25Band } from '../lib/risk';

export const THAILAND_VIEW = { center: [13.2, 101.0] as [number, number], zoom: 6 };
const THAILAND_BOUNDS = L.latLngBounds([5.4, 97.1], [20.7, 105.9]);

const BASEMAPS = {
  light: {
    label: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abc',
  },
} as const;

type BasemapKey = keyof typeof BASEMAPS;

export interface MapView {
  center: [number, number];
  zoom: number;
  nonce: number;
}

/* ── Imperative view driver ──────────────────────────────────── */

function ViewController({ view }: { view: MapView }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(view.center, view.zoom, { duration: 1.1 });
    // Re-fly whenever a new selection is made, even to the same village.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.nonce]);
  return null;
}

/* ── Markers ─────────────────────────────────────────────────── */

function villageIcon(village: Village, selected: boolean) {
  const hex = RISK[village.risk].hex;
  const size = selected ? 20 : village.risk === 'critical' ? 16 : 13;
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div class="marker-dot${village.risk === 'critical' ? ' is-critical' : ''}${
      selected ? ' is-selected' : ''
    }" style="--dot:${hex}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

function VillageMarker({
  village,
  selected,
  onSelect,
}: {
  village: Village;
  selected: boolean;
  onSelect: (v: Village) => void;
}) {
  const icon = useMemo(() => villageIcon(village, selected), [village, selected]);
  const r = RISK[village.risk];
  const air = pm25Band(village.pm25);

  return (
    <Marker
      position={[village.lat, village.lng]}
      icon={icon}
      zIndexOffset={selected ? 1000 : village.risk === 'critical' ? 500 : 0}
      eventHandlers={{ click: () => onSelect(village) }}
    >
      <Popup>
        <div className="w-48 p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-bold text-ink">{village.name}</h3>
              <p className="text-[10px] text-ink-3">{village.province}</p>
            </div>
            <span className={cn('mt-1 size-2.5 shrink-0 rounded-full', r.bg)} />
          </div>
          <dl className="space-y-1 border-t border-line pt-2">
            <div className="flex justify-between text-[10px]">
              <dt className="text-ink-3">PM2.5</dt>
              <dd className={cn('font-mono font-bold', RISK[air.level].text)}>
                {village.pm25} µg/m³
              </dd>
            </div>
            <div className="flex justify-between text-[10px]">
              <dt className="text-ink-3">ระดับความเสี่ยง</dt>
              <dd className={cn('font-bold', r.text)}>{r.label}</dd>
            </div>
            <div className="flex justify-between gap-2 text-[10px]">
              <dt className="shrink-0 text-ink-3">คาดการณ์</dt>
              <dd className="truncate font-medium text-ink-2">{village.disease}</dd>
            </div>
          </dl>
        </div>
      </Popup>
    </Marker>
  );
}

/* ── Floating control button ─────────────────────────────────── */

function MapButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex size-9 items-center justify-center rounded-xl border bg-surface/90 shadow-card backdrop-blur transition-all hover:bg-surface active:scale-95',
        active ? 'border-brand/40 text-brand' : 'border-line text-ink-2 hover:text-ink',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

/* ── Panel ───────────────────────────────────────────────────── */

export function MapPanel({
  villages,
  selected,
  view,
  userPos,
  onSelect,
  onLocate,
  onReset,
  invalidateKey,
}: {
  villages: Village[];
  selected: Village | null;
  view: MapView;
  userPos: [number, number] | null;
  onSelect: (v: Village) => void;
  onLocate: () => void;
  onReset: () => void;
  invalidateKey: string;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [basemap, setBasemap] = useState<BasemapKey>('light');

  // The map is display:none behind mobile tabs — Leaflet needs a nudge on return.
  useEffect(() => {
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 220);
    return () => clearTimeout(t);
  }, [map, invalidateKey]);

  const tiles = BASEMAPS[basemap];

  return (
    <div className="relative size-full">
      <MapContainer
        ref={setMap}
        center={THAILAND_VIEW.center}
        zoom={THAILAND_VIEW.zoom}
        minZoom={5}
        maxBounds={THAILAND_BOUNDS.pad(0.6)}
        zoomControl={false}
        className="z-0 size-full"
      >
        <TileLayer
          key={basemap}
          url={tiles.url}
          attribution={tiles.attribution}
          subdomains={tiles.subdomains}
        />
        <ViewController view={view} />

        {villages.map((v) => (
          <VillageMarker
            key={v.id}
            village={v}
            selected={selected?.id === v.id}
            onSelect={onSelect}
          />
        ))}

        {userPos && (
          <Marker
            position={userPos}
            icon={L.divIcon({
              className: 'bg-transparent border-0',
              html: '<div class="user-dot"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        )}
      </MapContainer>

      {/* Live data source chips */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
        <span className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-2.5 py-1 font-mono text-[10px] font-medium text-ink-2 shadow-card backdrop-blur">
          <Satellite className="size-3 text-brand" />
          SENTINEL-5P
          <span className="flex items-center gap-1 font-bold text-risk-low">
            <span className="size-1.5 animate-pulse rounded-full bg-risk-low" />
            ACTIVE
          </span>
        </span>
        <span className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-2.5 py-1 font-mono text-[10px] font-medium text-ink-2 shadow-card backdrop-blur">
          <Waves className="size-3 text-brand-2" />
          GISTDA FLOOD
          <span className="font-bold text-brand-2">LIVE</span>
        </span>
      </div>

      {/* Controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <MapButton icon={Plus} label="ซูมเข้า" onClick={() => map?.zoomIn()} />
        <MapButton icon={Minus} label="ซูมออก" onClick={() => map?.zoomOut()} />
        <MapButton icon={Maximize2} label="ดูทั้งประเทศ" onClick={onReset} />
        <MapButton icon={LocateFixed} label="ตำแหน่งของฉัน" onClick={onLocate} active={!!userPos} />
        <MapButton
          icon={Layers}
          label={`แผนที่: ${tiles.label}`}
          onClick={() => setBasemap((b) => (b === 'light' ? 'terrain' : 'light'))}
          active={basemap === 'terrain'}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden rounded-xl border border-line bg-surface/90 px-3 py-2 shadow-card backdrop-blur sm:block">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-3">
          ระดับความเสี่ยง
        </p>
        <div className="flex gap-3">
          {RISK_ORDER.map((lvl) => (
            <span key={lvl} className="flex items-center gap-1.5 text-[10px] font-medium text-ink-2">
              <span className={cn('size-2 rounded-full', RISK[lvl].bg)} />
              {RISK[lvl].label}
            </span>
          ))}
        </div>
      </div>

      {/* Result counter */}
      <div className="absolute bottom-3 right-3 z-10 rounded-full border border-line bg-surface/90 px-2.5 py-1 font-mono text-[10px] font-medium text-ink-2 shadow-card backdrop-blur">
        แสดง <span className="font-bold text-brand">{villages.length}</span> จุด
      </div>
    </div>
  );
}
