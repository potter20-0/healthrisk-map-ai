import { ExternalLink, Newspaper } from 'lucide-react';
import type { Village } from '../data';
import { cn } from '../lib/utils';
import type { NewsLevel } from '../lib/news';
import { useAreaNews } from '../lib/useAreaNews';

const LEVEL_STYLE: Record<NewsLevel, { label: string; chip: string }> = {
  watch: { label: 'เฝ้าระวัง', chip: 'bg-high-bg text-high-ink' },
  normal: { label: 'สถานการณ์ปกติ', chip: 'bg-low-bg text-low-ink' },
  none: { label: 'ไม่พบข่าวเด่น', chip: 'bg-fill text-ink-2' },
};

/** Hostname only, for a compact source label: "bangkokpost.com". */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Local-area news & situation, searched and analyzed by Gemini with Google
 * Search grounding. Real current information with verifiable source links —
 * distinct from the app's synthetic village metrics.
 */
export function AreaNews({
  village,
  compact = false,
}: {
  village: Village;
  compact?: boolean;
}) {
  const news = useAreaNews(village);
  if (news.status === 'disabled') return null;

  return (
    <div className="mt-5 border-t border-hairline pt-4">
      <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-ink">
        <Newspaper className="size-4 text-brand" />
        ข่าว/สถานการณ์ในพื้นที่
        <span className="rounded-full bg-brand-bg px-1.5 py-px text-[9.5px] font-medium text-brand">
          AI + ค้นเว็บ
        </span>
      </p>

      {news.status === 'loading' && (
        <p className="animate-pulse text-[12px] text-ink-3">
          กำลังค้นข่าวล่าสุดในจังหวัด{village.province}…
        </p>
      )}

      {news.status === 'error' && (
        <p className="text-[12px] text-ink-3">
          ดึงข่าวไม่สำเร็จในขณะนี้ — ลองเปิดหมู่บ้านนี้อีกครั้งภายหลัง
        </p>
      )}

      {news.status === 'ready' && (
        <div>
          <span
            className={cn(
              'inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold',
              LEVEL_STYLE[news.data.level].chip,
            )}
          >
            {LEVEL_STYLE[news.data.level].label}
          </span>

          <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{news.data.summary}</p>

          {news.data.sources.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {(compact ? news.data.sources.slice(0, 2) : news.data.sources).map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-brand hover:underline"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{s.title}</span>
                    <span className="shrink-0 font-mono text-ink-3">· {hostOf(s.url)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-[10px] leading-relaxed text-ink-3">
            สรุปโดย AI จากการค้นข่าวบนเว็บ โปรดตรวจสอบจากแหล่งข่าวต้นทางก่อนตัดสินใจ
          </p>
        </div>
      )}
    </div>
  );
}
