/**
 * Text-only brand lockup. There is no icon mark — the wordmark carries the
 * identity on its own, so it needs to hold up unaccompanied.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={
        'text-[15px] font-bold tracking-tight text-ink ' + (className ?? '')
      }
    >
      HealthRisk Map <span className="text-brand">AI</span>
    </span>
  );
}
