import { Droplets, FlaskConical, MapPin, ShieldCheck, Sparkles, Users, Wind, X } from 'lucide-react';
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
import { MetricBar, RiskBadge, SectionTitle } from './primitives';

/** Circular composite-score gauge. */
function ScoreGauge({ score, level }: { score: number; level: Village['risk'] }) {
  const r = RISK[level];
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="size-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-line"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={r.hex}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-mono text-base font-bold leading-none', r.text)}>
          {score}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-ink-3">ดัชนี</span>
      </div>
    </div>
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
  const air = pm25Band(village.pm25);
  const water = WATER_STYLE[village.water];
  const chem = chemicalBand(village.chemical);
  const score = riskScore(village);
  const tips = guidance(village);

  return (
    <div className="flex flex-col gap-4">
      {/* Identity */}
      <div className="flex items-start gap-3">
        <ScoreGauge score={score} level={village.risk} />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-bold leading-tight text-ink">
              {village.name}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-ink-3">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {village.province}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              <span className="font-mono">{village.population.toLocaleString('th-TH')}</span> คน
            </span>
          </p>
          <div className="mt-2">
            <RiskBadge level={village.risk} size="md" />
          </div>
        </div>
      </div>

      {/* AI prediction */}
      <div className={cn('rounded-2xl border p-3', r.soft, r.border)}>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sparkles className={cn('size-3.5', r.text)} />
          <span
            className={cn('text-[10px] font-bold uppercase tracking-[0.12em]', r.softText)}
          >
            AI Prediction
          </span>
        </div>
        <p className="text-[13px] font-semibold leading-snug text-ink">
          เสี่ยง<span className={r.text}> {village.disease} </span>
          {village.prediction === '—' ? (
            <span className="text-ink-2">— ไม่พบแนวโน้มผิดปกติ</span>
          ) : (
            <>
              ภายใน <span className="font-mono">{village.prediction}</span>
            </>
          )}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-2">
        <MetricBar
          label="PM2.5"
          value={village.pm25}
          unit="µg/m³"
          pct={air.pct}
          level={air.level}
          hint={`เกณฑ์ปลอดภัย ≤ 25 µg/m³ · ${RISK[air.level].label}`}
        />
        <div className="grid grid-cols-2 gap-2">
          <MetricBar
            label="คุณภาพน้ำ"
            value={water.label}
            pct={{ low: 20, medium: 55, high: 75, critical: 92 }[water.level]}
            level={water.level}
          />
          <MetricBar
            label="สารเคมี"
            value={village.chemical}
            unit="%"
            pct={village.chemical}
            level={chem}
          />
        </div>
      </div>

      {/* Guidance */}
      {!compact && (
        <div>
          <SectionTitle>คำแนะนำการปฏิบัติ</SectionTitle>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2 text-[11px] leading-snug text-ink-2">
                <ShieldCheck className="mt-px size-3.5 shrink-0 text-brand-2" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { icon: Wind, label: 'Sentinel-5P' },
          { icon: Droplets, label: 'GISTDA' },
          { icon: FlaskConical, label: 'อสม. Field' },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[9px] font-medium text-ink-3"
          >
            <Icon className="size-2.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
