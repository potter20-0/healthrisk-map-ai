import type { Village } from '../data';

export type RiskLevel = Village['risk'];

export interface RiskStyle {
  /** Thai label shown to users */
  label: string;
  /** Latin label for compact/mono contexts */
  code: string;
  /** Raw hex — for Leaflet markers and inline SVG */
  hex: string;
  /** Sort weight, high = more urgent */
  rank: number;
  text: string;
  bg: string;
  soft: string;
  softText: string;
  border: string;
  ring: string;
}

export const RISK: Record<RiskLevel, RiskStyle> = {
  critical: {
    label: 'วิกฤต',
    code: 'CRITICAL',
    hex: '#dc2626',
    rank: 4,
    text: 'text-risk-critical',
    bg: 'bg-risk-critical',
    soft: 'bg-red-50',
    softText: 'text-red-700',
    border: 'border-red-200',
    ring: 'ring-red-200',
  },
  high: {
    label: 'สูง',
    code: 'HIGH',
    hex: '#ea580c',
    rank: 3,
    text: 'text-risk-high',
    bg: 'bg-risk-high',
    soft: 'bg-orange-50',
    softText: 'text-orange-700',
    border: 'border-orange-200',
    ring: 'ring-orange-200',
  },
  medium: {
    label: 'ปานกลาง',
    code: 'MEDIUM',
    hex: '#d97706',
    rank: 2,
    text: 'text-risk-medium',
    bg: 'bg-risk-medium',
    soft: 'bg-amber-50',
    softText: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-200',
  },
  low: {
    label: 'ต่ำ',
    code: 'LOW',
    hex: '#16a34a',
    rank: 1,
    text: 'text-risk-low',
    bg: 'bg-risk-low',
    soft: 'bg-emerald-50',
    softText: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-200',
  },
};

export const RISK_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

/** Thai AQI-ish banding for PM2.5, used for the metric bars. */
export function pm25Band(pm25: number): { level: RiskLevel; pct: number } {
  const pct = Math.min(100, Math.round((pm25 / 180) * 100));
  if (pm25 >= 91) return { level: 'critical', pct };
  if (pm25 >= 51) return { level: 'high', pct };
  if (pm25 >= 26) return { level: 'medium', pct };
  return { level: 'low', pct };
}

export const WATER_STYLE: Record<Village['water'], { label: string; level: RiskLevel }> = {
  Safe: { label: 'ปลอดภัย', level: 'low' },
  Moderate: { label: 'เฝ้าระวัง', level: 'medium' },
  Unsafe: { label: 'ไม่ปลอดภัย', level: 'critical' },
};

export function chemicalBand(pct: number): RiskLevel {
  if (pct >= 70) return 'critical';
  if (pct >= 55) return 'high';
  if (pct >= 35) return 'medium';
  return 'low';
}

/**
 * A single 0-100 composite used for ranking and the detail gauge.
 * Weighted: air 40%, water 30%, chemical 30%.
 */
export function riskScore(v: Village): number {
  const air = Math.min(100, (v.pm25 / 150) * 100);
  const water = { Safe: 15, Moderate: 55, Unsafe: 95 }[v.water];
  return Math.round(air * 0.4 + water * 0.3 + v.chemical * 0.3);
}

/** Great-circle distance in km. */
export function distanceKm(
  a: [number, number],
  b: [number, number],
): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}

/** Standard public-health guidance keyed off the village's dominant hazard. */
export function guidance(v: Village): string[] {
  const tips: string[] = [];
  if (v.pm25 >= 91) tips.push('สวมหน้ากาก N95 เมื่อออกนอกอาคาร และงดกิจกรรมกลางแจ้ง');
  else if (v.pm25 >= 51) tips.push('ลดกิจกรรมกลางแจ้งที่ใช้แรงมาก โดยเฉพาะกลุ่มเปราะบาง');
  if (v.water === 'Unsafe') tips.push('ต้มน้ำก่อนดื่มทุกครั้ง และหลีกเลี่ยงการลุยน้ำท่วมขัง');
  else if (v.water === 'Moderate') tips.push('ใช้น้ำกรองหรือน้ำต้มสุกสำหรับดื่มและประกอบอาหาร');
  if (v.chemical >= 55) tips.push('ล้างผัก-ผลไม้ด้วยน้ำไหลผ่าน และสวมอุปกรณ์ป้องกันเมื่อพ่นสารเคมี');
  if (!tips.length) tips.push('ความเสี่ยงอยู่ในเกณฑ์ปกติ — เฝ้าระวังตามรอบปกติของ อสม.');
  return tips;
}
