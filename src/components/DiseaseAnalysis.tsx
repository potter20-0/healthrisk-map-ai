import { AlertTriangle, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { Village } from '../data';
import { cn } from '../lib/utils';
import { RISK } from '../lib/risk';
import {
  diseaseProfile,
  preventionPlan,
  vectorIcon,
  vectorLabel,
} from '../lib/disease';

/**
 * Disease analysis + prevention plan for a village. Grounds the AI
 * prediction in an assessed cause, warning symptoms and an at-risk group,
 * then lists concrete prevention steps. Reference content for a prototype.
 */
export function DiseaseAnalysis({
  village,
  compact = false,
}: {
  village: Village;
  compact?: boolean;
}) {
  const r = RISK[village.risk];
  const profile = diseaseProfile(village);
  const prevention = preventionPlan(village);
  const VectorIcon = vectorIcon(profile.vector);
  const symptoms = compact ? profile.symptoms.slice(0, 3) : profile.symptoms;
  const steps = compact ? prevention.slice(0, 3) : prevention;

  return (
    <div className="mt-4">
      {/* Prediction — the headline the analysis unpacks */}
      <div className={cn('rounded-xl p-3.5', r.bg)}>
        <div className="flex items-center gap-2">
          <Sparkles className={cn('size-3.5 shrink-0', r.text)} />
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
            AI วิเคราะห์โรคที่จะเกิด
          </p>
        </div>
        <p className="mt-1.5 text-[14px] font-semibold leading-snug text-ink">
          <span className={r.text}>{profile.name}</span>
          {village.prediction === '—' ? (
            <span className="font-normal text-ink-2"> — ไม่พบแนวโน้มผิดปกติ</span>
          ) : (
            <span className="font-normal text-ink-2">
              {' '}คาดว่าจะพบใน{' '}
              <span className="font-mono font-semibold text-ink">{village.prediction}</span>
            </span>
          )}
        </p>
      </div>

      {/* Assessed cause */}
      <div className="mt-3 flex gap-2.5">
        <div className={cn('grid size-8 shrink-0 place-items-center rounded-lg', r.bg)}>
          <VectorIcon className={cn('size-4', r.text)} />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink">
            สาเหตุที่ประเมิน
            <span className="rounded-full bg-fill px-1.5 py-px text-[9.5px] font-medium text-ink-2">
              {vectorLabel(profile.vector)}
            </span>
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-2">{profile.cause}</p>
        </div>
      </div>

      {/* Warning symptoms */}
      {village.prediction !== '—' && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            <AlertTriangle className="size-3.5 text-high-ink" />
            อาการที่ต้องเฝ้าระวัง
          </p>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s) => (
              <span
                key={s}
                className="rounded-lg bg-fill px-2 py-1 text-[11px] font-medium text-ink-2"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-3">
            <Users className="mt-px size-3.5 shrink-0" />
            กลุ่มเสี่ยง: {profile.vulnerable}
          </p>
        </div>
      )}

      {/* Prevention plan */}
      <div className="mt-4 border-t border-hairline pt-4">
        <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-ink">
          <ShieldCheck className="size-4 text-brand" />
          แนวทางป้องกัน
        </p>
        <ol className="space-y-2.5">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-2.5 text-[12px] leading-relaxed text-ink-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 font-mono text-[10px] font-bold text-brand">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {!compact && (
        <p className="mt-4 rounded-lg bg-fill px-3 py-2 text-[10.5px] leading-relaxed text-ink-3">
          ข้อมูลนี้เป็นการคาดการณ์จากข้อมูลจำลองเพื่อสาธิต ไม่ใช่การวินิจฉัยทางการแพทย์ —
          หากมีอาการรุนแรง โปรดพบแพทย์หรือโทรสายด่วน 1669
        </p>
      )}
    </div>
  );
}
