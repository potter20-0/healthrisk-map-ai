import { GoogleGenAI } from '@google/genai';
import type { Village } from '../data';
import { diseaseProfile } from './disease';

/**
 * Local-area news analysis via Gemini + Google Search grounding.
 *
 * Gemini searches the live web for recent health/environment news about the
 * village's province, then assesses how it bears on the predicted disease
 * risk. Grounding returns real source links, shown so users can verify.
 *
 * Reuses the existing GEMINI_API_KEY (no extra sign-up). This is the only
 * part of the app that uses *real* current information rather than the
 * synthetic sample data.
 */

const API_KEY = process.env.GEMINI_API_KEY;

export type NewsLevel = 'watch' | 'normal' | 'none';

export interface NewsSource {
  title: string;
  url: string;
}

export interface AreaNews {
  /** Impact on local risk, parsed from the model's tag */
  level: NewsLevel;
  /** 2–3 sentence Thai summary tying news to the risk */
  summary: string;
  /** Grounded web sources */
  sources: NewsSource[];
}

/** True when an API key is configured — lets the UI avoid offering news. */
export const areaNewsEnabled = Boolean(API_KEY);

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Province-level results are stable within a session — cache to avoid
// re-querying (and re-billing) when the same area is reopened.
const cache = new Map<string, AreaNews>();

const LEVEL_TOKENS: Record<string, NewsLevel> = {
  เฝ้าระวัง: 'watch',
  ปกติ: 'normal',
  ไม่พบข่าว: 'none',
};

/** Pull the leading [tag] off the model's reply and map it to a level. */
function parseLevel(text: string): { level: NewsLevel; body: string } {
  const m = text.match(/^\s*\[([^\]]+)\]\s*/);
  if (m) {
    const level = LEVEL_TOKENS[m[1].trim()] ?? 'normal';
    return { level, body: text.slice(m[0].length).trim() };
  }
  return { level: 'normal', body: text.trim() };
}

export async function fetchAreaNews(
  village: Village,
  signal?: AbortSignal,
): Promise<AreaNews | null> {
  if (!ai) return null;

  const cached = cache.get(village.province);
  if (cached) return cached;

  const disease = diseaseProfile(village).name;
  const prompt = `ค้นข่าวและสถานการณ์ล่าสุด (ภายใน 30 วันที่ผ่านมา) ในจังหวัด${village.province} ประเทศไทย ` +
    `ที่เกี่ยวข้องกับสุขภาพ สิ่งแวดล้อม มลพิษทางอากาศ (PM2.5/ไฟป่า/หมอกควัน) คุณภาพน้ำ การระบาดของโรค หรือภัยธรรมชาติ ` +
    `โดยเฉพาะที่อาจเชื่อมโยงกับความเสี่ยง "${disease}"\n\n` +
    `ตอบเป็นภาษาไทย รูปแบบดังนี้:\n` +
    `บรรทัดแรกขึ้นต้นด้วยแท็กในวงเล็บเหลี่ยมหนึ่งค่า: [เฝ้าระวัง] ถ้ามีข่าวที่เพิ่มความเสี่ยง, [ปกติ] ถ้ามีข่าวแต่ไม่น่ากังวลเป็นพิเศษ, หรือ [ไม่พบข่าว] ถ้าไม่พบข่าวเด่นที่เกี่ยวข้อง\n` +
    `จากนั้นสรุปสั้น 2-3 ประโยคว่าพบอะไรบ้างและส่งผลต่อความเสี่ยงสุขภาพในพื้นที่อย่างไร ` +
    `หากไม่พบข่าวที่เกี่ยวข้องให้บอกตามตรง ห้ามแต่งข่าวขึ้นเอง`;

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        abortSignal: signal,
      },
    });

    const raw = res.text?.trim();
    if (!raw) return null;

    const { level, body } = parseLevel(raw);

    const chunks =
      res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const seen = new Set<string>();
    const sources: NewsSource[] = [];
    for (const c of chunks) {
      const url = c.web?.uri;
      if (!url || seen.has(url)) continue;
      seen.add(url);
      sources.push({ title: c.web?.title || url, url });
      if (sources.length >= 4) break;
    }

    const result: AreaNews = { level, summary: body, sources };
    cache.set(village.province, result);
    return result;
  } catch {
    return null; // key/network/grounding failure — UI falls back quietly
  }
}
