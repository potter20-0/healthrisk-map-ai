import { motion } from 'motion/react';
import { ChevronRight, Users } from 'lucide-react';
import type { Village } from '../data';
import { cn } from '../lib/utils';
import { RISK, pm25Band, riskScore } from '../lib/risk';
import { RiskBadge } from './primitives';

export function VillageCard({
  village,
  active,
  distance,
  onClick,
}: {
  village: Village;
  active: boolean;
  distance?: number;
  onClick: () => void;
}) {
  const r = RISK[village.risk];
  const score = riskScore(village);
  const air = pm25Band(village.pm25);

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border bg-surface p-3.5 pl-4 text-left transition-all',
        active
          ? 'border-brand/40 shadow-card ring-2 ring-brand/15'
          : 'border-line hover:border-line-strong hover:shadow-card',
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', r.bg)} aria-hidden />

      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-ink">{village.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-ink-3">
            <span className="truncate">{village.province}</span>
            <span className="text-line-strong">·</span>
            <Users className="size-3 shrink-0" />
            <span className="font-mono">{village.population.toLocaleString('th-TH')}</span>
            {distance !== undefined && (
              <>
                <span className="text-line-strong">·</span>
                <span className="font-mono text-brand">{distance.toFixed(0)} กม.</span>
              </>
            )}
          </p>
        </div>
        <RiskBadge level={village.risk} />
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">
              PM2.5
            </span>
            <span className={cn('font-mono text-[11px] font-bold', RISK[air.level].text)}>
              {village.pm25}
              <span className="ml-0.5 text-[9px] font-medium text-ink-3">µg/m³</span>
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div
              className={cn('h-full rounded-full', RISK[air.level].bg)}
              style={{ width: `${Math.max(4, air.pct)}%` }}
            />
          </div>
        </div>

        <div className="h-8 w-px bg-line" />

        <div className="w-[42%] shrink-0">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-3">
            คาดการณ์
          </p>
          <p className="truncate text-[10px] font-semibold text-ink-2">{village.disease}</p>
        </div>

        <ChevronRight
          className={cn(
            'size-4 shrink-0 transition-colors',
            active ? 'text-brand' : 'text-ink-3',
          )}
        />
      </div>

      <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">
          ดัชนีรวม
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
          <div className={cn('h-full rounded-full', r.bg)} style={{ width: `${score}%` }} />
        </div>
        <span className={cn('font-mono text-[10px] font-bold tabular-nums', r.text)}>
          {score}
        </span>
      </div>
    </motion.button>
  );
}
