import React from 'react';
import { cn } from '../lib/utils';
import { RISK, type RiskLevel } from '../lib/risk';

/* ── Section heading ─────────────────────────────────────────── */

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
        {children}
      </h2>
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
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        r.soft,
        r.softText,
        r.border,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      )}
    >
      <span className={cn('rounded-full', r.bg, size === 'sm' ? 'size-1.5' : 'size-2')} />
      {r.label}
    </span>
  );
}

/* ── Metric with progress bar ────────────────────────────────── */

export function MetricBar({
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
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
          {label}
        </span>
        <span className={cn('font-mono text-sm font-semibold tabular-nums', r.text)}>
          {value}
          {unit && <span className="ml-0.5 text-[10px] font-medium">{unit}</span>}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', r.bg)}
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </div>
      {hint && <p className="mt-1.5 text-[10px] font-medium text-ink-3">{hint}</p>}
    </div>
  );
}

/* ── Compact metric tile ─────────────────────────────────────── */

export function MetricTile({
  label,
  value,
  unit,
  level,
}: {
  label: string;
  value: string | number;
  unit?: string;
  level: RiskLevel;
}) {
  const r = RISK[level];
  return (
    <div className={cn('rounded-xl border p-2.5 text-center', r.soft, r.border)}>
      <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-3">
        {label}
      </p>
      <p className={cn('font-mono text-sm font-bold tabular-nums', r.text)}>
        {value}
        {unit && <span className="ml-0.5 text-[10px]">{unit}</span>}
      </p>
    </div>
  );
}

/* ── Stat tile (dashboard counters) ──────────────────────────── */

export function StatTile({
  label,
  value,
  level,
  trend,
  onClick,
  active,
}: {
  label: string;
  value: number;
  level: RiskLevel;
  trend?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const r = RISK[level];
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'rounded-2xl border bg-surface p-3 text-left transition-all',
        active ? cn(r.border, 'ring-2', r.ring) : 'border-line',
        onClick && 'hover:border-line-strong hover:shadow-card active:scale-[0.98]',
      )}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span className={cn('size-2 rounded-full', r.bg)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
          {label}
        </span>
      </div>
      <div className={cn('font-mono text-2xl font-bold tabular-nums', r.text)}>{value}</div>
      {trend && (
        <div
          className={cn(
            'mt-1 font-mono text-[10px] font-medium',
            trend.startsWith('+') ? 'text-risk-critical' : 'text-risk-low',
          )}
        >
          {trend} จากสัปดาห์ก่อน
        </div>
      )}
    </Tag>
  );
}

/* ── Risk distribution bar ───────────────────────────────────── */

export function RiskDistribution({
  counts,
  total,
}: {
  counts: Record<RiskLevel, number>;
  total: number;
}) {
  const order: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {order.map((lvl) =>
          counts[lvl] ? (
            <div
              key={lvl}
              className={cn('h-full first:rounded-l-full last:rounded-r-full', RISK[lvl].bg)}
              style={{ width: `${(counts[lvl] / total) * 100}%` }}
              title={`${RISK[lvl].label}: ${counts[lvl]}`}
            />
          ) : null,
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {order.map((lvl) => (
          <span key={lvl} className="flex items-center gap-1.5 text-[10px] text-ink-2">
            <span className={cn('size-1.5 rounded-full', RISK[lvl].bg)} />
            {RISK[lvl].label}
            <span className="font-mono font-semibold text-ink">{counts[lvl]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Satellite feed row ──────────────────────────────────────── */

export function SatFeedItem({
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
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition-colors hover:border-line-strong">
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', r.soft)}>
        <Icon className={cn('size-4', r.text)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-ink">{name}</p>
        <p className="font-mono text-[10px] text-ink-3">{value}</p>
      </div>
      <span
        className={cn(
          'rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold',
          r.soft,
          r.softText,
          r.border,
        )}
      >
        {status}
      </span>
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
    <div className="relative pl-6">
      <span
        className={cn(
          'absolute left-0 top-1 size-2.5 rounded-full ring-4 ring-surface',
          RISK[level].bg,
        )}
      />
      <p className="mb-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">{time}</p>
      <p className="text-[11px] font-medium leading-snug text-ink-2">{text}</p>
    </div>
  );
}

/* ── Mobile nav button ───────────────────────────────────────── */

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
        'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 transition-colors',
        active ? 'text-brand' : 'text-ink-3',
      )}
    >
      <span className="relative">
        <Icon className="size-5" />
        {!!badge && (
          <span className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-risk-critical px-1 font-mono text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
      {active && (
        <span className="absolute -top-px h-0.5 w-8 rounded-full bg-brand" aria-hidden />
      )}
    </button>
  );
}

/* ── Filter pill ─────────────────────────────────────────────── */

export function FilterPill({
  active,
  onClick,
  children,
  dot,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all',
        active
          ? 'border-brand bg-brand text-white shadow-sm'
          : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink',
      )}
    >
      {dot && (
        <span
          className={cn('size-1.5 rounded-full', active && 'ring-1 ring-white/60')}
          style={{ background: dot }}
        />
      )}
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'font-mono text-[10px] tabular-nums',
            active ? 'text-white/75' : 'text-ink-3',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
