import React from 'react';
import { cn } from '../lib/utils';
import { RISK, type RiskLevel } from '../lib/risk';

/* ── Section label ───────────────────────────────────────────
   Sentence case at readable weight. The previous design shouted
   every label in 10px all-caps, which flattened the hierarchy.  */

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <h2 className="text-[13px] font-semibold tracking-tight text-ink">{children}</h2>
      {action}
    </div>
  );
}

/* ── Risk badge ──────────────────────────────────────────────── */

export function RiskBadge({ level, size = 'sm' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const r = RISK[level];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold',
        r.bg,
        r.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={cn('size-1.5 rounded-full', r.dot)} />
      {r.label}
    </span>
  );
}

/* ── Metric row — label, value, hairline bar ─────────────────── */

export function MetricRow({
  label,
  value,
  unit,
  pct,
  level,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  pct: number;
  level: RiskLevel;
  hint?: string;
}) {
  const r = RISK[level];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium text-ink-2">{label}</span>
        <span className="flex items-baseline gap-1">
          <span className={cn('font-mono text-[15px] font-semibold', r.text)}>{value}</span>
          {unit && <span className="text-[10px] font-medium text-ink-3">{unit}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-fill">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', r.dot)}
          style={{ width: `${Math.max(3, Math.min(100, pct))}%` }}
        />
      </div>
      {hint && <p className="mt-1 text-[10.5px] text-ink-3">{hint}</p>}
    </div>
  );
}

/* ── Big number, used as a focal point ───────────────────────── */

export function BigStat({
  value,
  label,
  sub,
  level,
}: {
  value: React.ReactNode;
  label: string;
  sub?: string;
  level?: RiskLevel;
}) {
  return (
    <div>
      <div
        className={cn(
          'font-mono text-[2.6rem] font-bold leading-none tracking-tighter',
          level ? RISK[level].text : 'text-ink',
        )}
      >
        {value}
      </div>
      <p className="mt-1.5 text-[12px] font-medium text-ink-2">{label}</p>
      {sub && <p className="text-[11px] text-ink-3">{sub}</p>}
    </div>
  );
}

/* ── Counter chip — a filter target, not a card ──────────────── */

export function CountChip({
  level,
  value,
  active,
  onClick,
}: {
  level: RiskLevel;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  const r = RISK[level];
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-all',
        active ? cn(r.bg, 'ring-1 ring-inset', r.ring) : 'hover:bg-fill',
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className={cn('size-2 rounded-full', r.dot)} />
        <span className="text-[11px] font-medium text-ink-2">{r.label}</span>
      </span>
      <span className={cn('font-mono text-xl font-bold leading-none', r.text)}>{value}</span>
    </button>
  );
}

/* ── Risk distribution ───────────────────────────────────────── */

export function RiskDistribution({
  counts,
  total,
}: {
  counts: Record<RiskLevel, number>;
  total: number;
}) {
  const order: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  return (
    <div className="flex h-1.5 gap-px overflow-hidden rounded-full">
      {order.map((lvl) =>
        counts[lvl] ? (
          <div
            key={lvl}
            className={cn('h-full', RISK[lvl].dot)}
            style={{ width: `${(counts[lvl] / total) * 100}%` }}
            title={`${RISK[lvl].label}: ${counts[lvl]}`}
          />
        ) : null,
      )}
    </div>
  );
}

/* ── Feed row ────────────────────────────────────────────────── */

export function FeedRow({
  icon: Icon,
  name,
  value,
  status,
  level,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  value: string;
  status: string;
  level: RiskLevel;
}) {
  const r = RISK[level];
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={cn('grid size-8 shrink-0 place-items-center rounded-lg', r.bg)}>
        <Icon className={cn('size-4', r.text)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-ink">{name}</p>
        <p className="truncate text-[11px] text-ink-3">{value}</p>
      </div>
      <span className={cn('font-mono text-[10px] font-semibold', r.text)}>{status}</span>
    </div>
  );
}

/* ── Alert timeline row ──────────────────────────────────────── */

export function TimelineItem({
  time,
  text,
  level,
}: {
  time: string;
  text: string;
  level: RiskLevel;
}) {
  return (
    <div className="relative pl-5">
      <span
        className={cn(
          'absolute left-0 top-[7px] size-2 rounded-full ring-4 ring-surface',
          RISK[level].dot,
        )}
      />
      <p className="text-[12px] font-medium leading-snug text-ink">{text}</p>
      <p className="mt-0.5 text-[10.5px] text-ink-3">{time}</p>
    </div>
  );
}

/* ── Mobile nav ──────────────────────────────────────────────── */

export function NavButton({
  active,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors',
        active ? 'text-brand' : 'text-ink-3',
      )}
    >
      <span className="relative">
        <Icon className="size-[1.15rem]" />
        {!!badge && (
          <span className="absolute -right-2 -top-1.5 grid min-w-[15px] place-items-center rounded-full bg-critical px-1 font-mono text-[9px] font-bold text-white ring-2 ring-surface">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10.5px] font-medium">{label}</span>
    </button>
  );
}

/* ── Segmented filter control ────────────────────────────────── */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; dot?: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-xl bg-fill p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-[0.6rem] px-2 py-1.5 text-[11.5px] font-medium transition-all',
              active
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-2 hover:text-ink',
            )}
          >
            {o.dot && (
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: o.dot }}
              />
            )}
            <span className="truncate">{o.label}</span>
            {o.count !== undefined && (
              <span
                className={cn(
                  'font-mono text-[10px]',
                  active ? 'text-ink-3' : 'text-ink-3/70',
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
