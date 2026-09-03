import { MapPin, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import type { Village } from '../data';
import { cn } from '../lib/utils';
import {
  RISK,
  WATER_STYLE,
  chemicalBand,
  guidance,
  pm25Band,
  riskScore,
} from '../lib/risk';
import { MetricRow, RiskBadge } from './primitives';

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
  const air = pm25Band(village.pm25);
  const water = WATER_STYLE[village.water];
  const chem = chemicalBand(village.chemical);
  const score = riskScore(village);
  const tips = guidance(village);

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

      {/* Prediction */}
      <div className="mt-4 flex gap-2.5 rounded-xl border border-hairline p-3">
        <Sparkles className={cn('mt-px size-4 shrink-0', r.text)} />
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
            AI Prediction
          </p>
          <p className="mt-0.5 text-[13px] font-medium leading-snug text-ink">
            เสี่ยง<span className={cn('font-semibold', r.text)}> {village.disease}</span>
            {village.prediction === '—' ? (
              <span className="text-ink-2"> — ไม่พบแนวโน้มผิดปกติ</span>
            ) : (
              <>
                {' '}ภายใน <span className="font-mono font-semibold">{village.prediction}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-5 space-y-3.5">
        <MetricRow
          label="ฝุ่น PM2.5"
          value={village.pm25}
          unit="µg/m³"
          pct={air.pct}
          level={air.level}
          hint="เกณฑ์ปลอดภัย ≤ 25 µg/m³"
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

      {/* Guidance */}
      {!compact && (
        <div className="mt-5 border-t border-hairline pt-4">
          <p className="mb-2.5 text-[13px] font-semibold tracking-tight text-ink">
            คำแนะนำการปฏิบัติ
          </p>
          <ul className="space-y-2.5">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2 text-[12px] leading-relaxed text-ink-2">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
