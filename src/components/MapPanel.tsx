import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, LocateFixed, Maximize2, Minus, Plus } from 'lucide-react';
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
  const size = selected ? 20 : village.risk === 'critical' ? 15 : 12;
  return L.divIcon({
    className: 'relative bg-transparent border-0',
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
        <div className="w-44 p-3">
          <div className="flex items-start gap-2">
            <span className={cn('mt-1 size-2 shrink-0 rounded-full', r.dot)} />
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold tracking-tight text-ink">
                {village.name}
              </h3>
              <p className="text-[10.5px] text-ink-3">{village.province}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-end justify-between border-t border-hairline pt-2.5">
            <div>
              <p className="text-[9.5px] text-ink-3">PM2.5</p>
              <p
                className={cn(
                  'font-mono text-base font-semibold leading-none',
                  RISK[air.level].text,
                )}
              >
                {village.pm25}
              </p>
            </div>
            <p className="max-w-[52%] truncate text-right text-[10.5px] text-ink-2">
              {village.disease}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

/* ── Floating control ────────────────────────────────────────── */

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
        'grid size-8 place-items-center transition-colors hover:bg-fill active:bg-hairline',
        active ? 'text-brand' : 'text-ink-2 hover:text-ink',
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

      {/* Live indicator — one quiet chip instead of two mono badges */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-surface/95 py-1.5 pl-2.5 pr-3 shadow-pop ring-1 ring-hairline backdrop-blur">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-low opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-low" />
        </span>
        <span className="text-[10.5px] font-medium text-ink-2">
          Sentinel-5P &amp; GISTDA · ถ่ายทอดสด
        </span>
      </div>

      {/* Controls — one grouped stack, not five floating pills */}
      <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-xl bg-surface/95 shadow-pop ring-1 ring-hairline backdrop-blur">
        <MapButton icon={Plus} label="ซูมเข้า" onClick={() => map?.zoomIn()} />
        <MapButton icon={Minus} label="ซูมออก" onClick={() => map?.zoomOut()} />
        <span className="mx-1.5 h-px bg-hairline" />
        <MapButton icon={Maximize2} label="ดูทั้งประเทศ" onClick={onReset} />
        <MapButton
          icon={LocateFixed}
          label="ตำแหน่งของฉัน"
          onClick={onLocate}
          active={!!userPos}
        />
        <MapButton
          icon={Layers}
          label={`แผนที่: ${tiles.label}`}
          onClick={() => setBasemap((b) => (b === 'light' ? 'terrain' : 'light'))}
          active={basemap === 'terrain'}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden items-center gap-3 rounded-full bg-surface/95 px-3 py-1.5 shadow-pop ring-1 ring-hairline backdrop-blur sm:flex">
        {RISK_ORDER.map((lvl) => (
          <span key={lvl} className="flex items-center gap-1.5 text-[10.5px] text-ink-2">
            <span className={cn('size-2 rounded-full', RISK[lvl].dot)} />
            {RISK[lvl].label}
          </span>
        ))}
      </div>

      {/* Result count */}
      <div className="absolute bottom-3 right-3 z-10 rounded-full bg-surface/95 px-2.5 py-1 text-[10.5px] text-ink-2 shadow-pop ring-1 ring-hairline backdrop-blur">
        <span className="font-mono font-semibold text-ink">{villages.length}</span> จุด
      </div>
    </div>
  );
}
