import type { Village } from '../data';
import { cn } from '../lib/utils';
import { RISK, pm25Band, riskScore } from '../lib/risk';

/**
 * A list row, not a card. The previous version stacked a badge, two
 * progress bars, a chevron and four labels into one tile — every element
 * fighting for the same attention. This keeps a single scan line: name,
 * risk, and the one number that matters.
 */
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
  const air = pm25Band(village.pm25);
  const score = riskScore(village);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
        active ? 'bg-brand-bg' : 'hover:bg-fill',
      )}
    >
      {/* Risk spine — the only always-on colour in the row */}
      <span
        className={cn(
          'h-9 w-0.75 shrink-0 rounded-full transition-all',
          r.dot,
          active && 'h-11',
        )}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3
            className={cn(
              'truncate text-[13.5px] font-semibold tracking-tight',
              active ? 'text-brand' : 'text-ink',
            )}
          >
            {village.name}
          </h3>
          <span className="shrink-0 text-[11px] text-ink-3">{village.province}</span>
        </div>

        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-ink-2">
          <span className="truncate">{village.disease}</span>
          {distance !== undefined && (
            <>
              <span className="text-ink-3">·</span>
              <span className="shrink-0 font-mono text-brand">{distance.toFixed(0)} กม.</span>
            </>
          )}
        </p>
      </div>

      {/* Value column */}
      <div className="shrink-0 text-right">
        <div className={cn('font-mono text-[15px] font-semibold leading-none', RISK[air.level].text)}>
          {village.pm25}
        </div>
        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[10px] text-ink-3">ดัชนี</span>
          <span className={cn('font-mono text-[10.5px] font-semibold', r.text)}>{score}</span>
        </div>
      </div>
    </button>
  );
}
