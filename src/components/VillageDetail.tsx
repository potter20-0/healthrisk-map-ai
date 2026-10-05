import { MapPin, Radio, Users, X } from 'lucide-react';
import type { Village } from '../data';
import { cn } from '../lib/utils';
import {
  RISK,
  WATER_STYLE,
  chemicalBand,
  pm25Band,
  riskScore,
} from '../lib/risk';
import { useLiveAqi } from '../lib/useLiveAqi';
import { MetricRow, RiskBadge } from './primitives';
import { DiseaseAnalysis } from './DiseaseAnalysis';
import { AreaNews } from './AreaNews';

/** "1 ต.ค. 20:00 น." — short Thai date+time for the live reading. */
function formatLiveTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) +
    ' น.'
  );
}

export function VillageDetail({
  village,
  onClose,
  compact = false,
}: {
  village: Village;
  onClose?: () => void;
  compact?: boolean;
}) {
  const r = RISK[village.risk];
  const water = WATER_STYLE[village.water];
  const chem = chemicalBand(village.chemical);
  const score = riskScore(village);

  // Live air quality (WAQI) when a token is configured; otherwise sample data.
  const live = useLiveAqi(village.lat, village.lng);
  const livePm25 = live.status === 'ready' ? live.data.pm25 : null;
  const pm25 = livePm25 ?? village.pm25;
  const air = pm25Band(pm25);
  // Feed live PM2.5 into the air-driven guidance when available.
  const effectiveVillage = livePm25 != null ? { ...village, pm25 } : village;

  return (
    <div className="flex flex-col">
      {/* Header — name leads, close sits quietly */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-bold tracking-tight text-ink">
            {village.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-2">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-ink-3" />
              {village.province}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3 text-ink-3" />
              <span className="font-mono">{village.population.toLocaleString('th-TH')}</span> คน
            </span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="-mr-1.5 -mt-1 shrink-0 rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-fill hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Score — the focal point of the panel */}
      <div className={cn('mt-4 flex items-end gap-4 rounded-2xl p-4', r.bg)}>
        <div>
          <div className={cn('font-mono text-[3rem] font-bold leading-none tracking-tighter', r.text)}>
            {score}
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-ink-2">ดัชนีความเสี่ยงรวม</p>
        </div>
        <div className="flex-1 pb-1 text-right">
          <RiskBadge level={village.risk} size="md" />
          {/* 100-step scale so the number has a frame of reference */}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/70">
            <div
              className={cn('h-full rounded-full transition-[width] duration-700', r.dot)}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-1 font-mono text-[9.5px] text-ink-3">0 — 100</p>
        </div>
      </div>

      {/* Live air-quality status (Open-Meteo, no key required) */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-hairline px-3 py-2">
        <Radio
          className={cn(
            'size-3.5 shrink-0',
            live.status === 'ready' ? 'text-low-ink' : 'text-ink-3',
            live.status === 'loading' && 'animate-pulse',
          )}
        />
        {live.status === 'loading' && (
          <span className="text-[11px] text-ink-3">กำลังดึงข้อมูลอากาศสด…</span>
        )}
        {live.status === 'error' && (
          <span className="text-[11px] text-ink-3">
            เชื่อมต่อข้อมูลสดไม่ได้ — แสดงข้อมูลจำลองแทน
          </span>
        )}
        {live.status === 'ready' && (
          <p className="min-w-0 flex-1 truncate text-[11px] text-ink-2">
            <span className="font-semibold text-low-ink">อากาศสด</span> · AQI {live.data.aqi}
            <span className="text-ink-3">
              {' '}· {formatLiveTime(live.data.time)} · {live.data.source}
            </span>
          </p>
        )}
      </div>

      {/* Metrics — the evidence behind the risk score */}
      <div className="mt-4 space-y-3.5">
        <MetricRow
          label="ฝุ่น PM2.5"
          value={pm25}
          unit="µg/m³"
          pct={air.pct}
          level={air.level}
          hint={
            livePm25 != null
              ? 'ค่าสดจาก Open-Meteo · เกณฑ์ปลอดภัย ≤ 25 µg/m³'
              : 'ข้อมูลจำลอง · เกณฑ์ปลอดภัย ≤ 25 µg/m³'
          }
        />
        <MetricRow
          label="คุณภาพน้ำ"
          value={water.label}
          pct={{ low: 20, medium: 55, high: 75, critical: 92 }[water.level]}
          level={water.level}
        />
        <MetricRow
          label="สารเคมีตกค้าง"
          value={village.chemical}
          unit="%"
          pct={village.chemical}
          level={chem}
        />
      </div>

      {/* Disease analysis + prevention */}
      <div className="mt-5 border-t border-hairline pt-1">
        <DiseaseAnalysis village={effectiveVillage} compact={compact} />
      </div>

      {/* Local-area news & situation (real, AI-analyzed) */}
      <AreaNews village={village} compact={compact} />
    </div>
  );
}
