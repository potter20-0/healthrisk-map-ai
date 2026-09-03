/**
 * HealthRisk Map AI identity mark.
 *
 * A location pin whose interior is an ECG pulse that breaks out past the
 * silhouette on both sides — geography plus live vitals, which is what the
 * product actually is. Stroke-based so it stays crisp at favicon sizes and
 * inherits `currentColor` from whatever it sits on.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Pin silhouette */}
      <path d="M12 21.5s6.75-6.1 6.75-11A6.75 6.75 0 1 0 5.25 10.5c0 4.9 6.75 11 6.75 11Z" />
      {/* Pulse — deliberately overshoots the pin edges */}
      <path
        d="M3.4 10.4h5.5l1.4-3 2 6.1 1.5-3.1h6.8"
        strokeWidth="1.7"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Mark locked into its brand tile — the header/app-icon lockup. */
export function LogoTile({ className }: { className?: string }) {
  return (
    <span
      className={
        'relative grid place-items-center overflow-hidden rounded-[0.7rem] bg-linear-to-br from-brand to-brand-accent text-white shadow-sm shadow-brand/25 ' +
        (className ?? '')
      }
    >
      {/* Soft top-left sheen so the tile reads as a physical object */}
      <span className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/25 to-transparent" />
      <LogoMark className="relative size-[62%]" />
    </span>
  );
}

export function Wordmark() {
  return (
    <span className="text-[15px] font-bold tracking-tight text-ink">
      HealthRisk<span className="text-ink-3 font-semibold"> · </span>
      <span className="text-brand">Map</span>
    </span>
  );
}
