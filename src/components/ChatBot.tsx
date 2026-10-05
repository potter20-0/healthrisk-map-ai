import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GoogleGenAI, type Chat } from '@google/genai';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { VILLAGES } from '../data';
import { cn } from '../lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  'หมู่บ้านไหนเสี่ยงที่สุดตอนนี้',
  'PM2.5 เฉลี่ยทั่วประเทศเท่าไหร่',
  'จังหวัดไหนน้ำไม่ปลอดภัยบ้าง',
];

/** Compact village data the model can ground its answers in — synthetic
 *  sample data (see data.ts), so the system instruction says as much. */
function buildSystemInstruction() {
  const rows = VILLAGES.map(
    (v) =>
      `${v.name}|${v.province}|${v.risk}|pm25=${v.pm25}|น้ำ=${v.water}|เคมี=${v.chemical}%|${v.disease}|ทำนาย=${v.prediction}|ประชากร=${v.population}`,
  ).join('\n');

  return `คุณคือผู้ช่วย AI ของแอป "HealthRisk Map AI" ระบบแผนที่ความเสี่ยงสุขภาพชุมชนในประเทศไทย
ตอบเป็นภาษาไทยเสมอ กระชับ ชัดเจน เป็นมิตร และอ้างอิงจากข้อมูลหมู่บ้านด้านล่างเมื่อถูกถามเกี่ยวกับความเสี่ยง คุณภาพอากาศ (PM2.5) คุณภาพน้ำ สารเคมีตกค้าง หรือคำแนะนำด้านสุขภาพของพื้นที่ใดพื้นที่หนึ่ง
ข้อมูลทั้งหมดเป็น synthetic sample data ที่สร้างขึ้นสำหรับ hackathon เท่านั้น ไม่ใช่ข้อมูลจริง — หากผู้ใช้ถามคำถามที่ฟังดูจริงจังหรือฉุกเฉิน ให้ตอบตามข้อมูลนี้พร้อมย้ำว่าเป็นข้อมูลจำลอง และแนะนำให้ติดต่อหน่วยงานสาธารณสุขในพื้นที่หรือสายด่วน 1669 สำหรับเหตุฉุกเฉินจริง
รูปแบบข้อมูลแต่ละบรรทัด: ชื่อหมู่บ้าน|จังหวัด|ระดับความเสี่ยง|pm25|คุณภาพน้ำ|สารเคมี|โรคที่คาดการณ์|ระยะเวลาทำนาย|ประชากร

${rows}`;
}

const API_KEY = process.env.GEMINI_API_KEY;

/** Gemini replies use light Markdown (bold, `*` bullets) — render just
 *  enough of it that responses don't show literal `**`/`*` characters. */
function renderModelText(text: string) {
  return text.split('\n').map((line, i) => {
    const bullet = line.match(/^[*-]\s+(.*)/);
    const content = bullet ? bullet[1] : line;
    const parts = content
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .filter(Boolean)
      .map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={j}>{part.slice(1, -1)}</em>;
        }
        return <span key={j}>{part}</span>;
      });
    return (
      <p key={i} className={cn(bullet && 'pl-3.5 -indent-3.5', !content && 'h-2')}>
        {bullet && '•  '}
        {parts}
      </p>
    );
  });
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = useMemo(
    () => (API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null),
    [],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading || !ai) return;

    setInput('');
    setError(null);
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);

    try {
      chatRef.current ??= ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: buildSystemInstruction() },
      });

      const stream = await chatRef.current.sendMessageStream({ message: q });
      setMessages((m) => [...m, { role: 'model', text: '' }]);
      let acc = '';
      for await (const chunk of stream) {
        acc += chunk.text ?? '';
        const next = acc;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'model', text: next };
          return copy;
        });
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อผู้ช่วย AI กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'ปิดผู้ช่วย AI' : 'เปิดผู้ช่วย AI'}
        className={cn(
          // Cleared above the mobile nav bar (3.75rem) and the map's own
          // bottom-right "N จุด" count badge that floats just above it.
          'fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-40 grid size-13 place-items-center rounded-full bg-brand text-white shadow-float transition-transform active:scale-95 md:bottom-5 md:right-5',
          open && 'rotate-90',
        )}
      >
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="fixed bottom-[calc(10.25rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-[min(32rem,68dvh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-surface shadow-float ring-1 ring-hairline md:bottom-24 md:right-5"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-bg text-brand">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-tight text-ink">
                  ผู้ช่วย AI
                </p>
                <p className="truncate text-[10.5px] text-ink-3">ถามเกี่ยวกับความเสี่ยงในพื้นที่</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
              {!ai ? (
                <div className="rounded-xl bg-fill px-3.5 py-3 text-[12px] leading-relaxed text-ink-2">
                  ยังไม่ได้ตั้งค่า <span className="font-mono text-[11px]">GEMINI_API_KEY</span> —
                  เพิ่มคีย์ในไฟล์ <span className="font-mono text-[11px]">.env</span> แล้วรีสตาร์ทแอป
                  เพื่อเปิดใช้งานผู้ช่วย AI
                </div>
              ) : messages.length === 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[12px] leading-relaxed text-ink-2">
                    สวัสดีค่ะ ถามได้เลยเกี่ยวกับความเสี่ยงสุขภาพ คุณภาพอากาศ หรือน้ำในแต่ละพื้นที่
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full bg-fill px-3 py-1.5 text-left text-[11.5px] font-medium text-ink-2 transition-colors hover:bg-hairline hover:text-ink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed',
                      m.role === 'user'
                        ? 'ml-auto whitespace-pre-wrap rounded-br-sm bg-brand text-white'
                        : 'rounded-bl-sm bg-fill text-ink',
                    )}
                  >
                    {m.role === 'user'
                      ? m.text
                      : m.text
                        ? renderModelText(m.text)
                        : loading && i === messages.length - 1
                          ? '…'
                          : ''}
                  </div>
                ))
              )}
              {error && (
                <div className="rounded-xl bg-critical-bg px-3.5 py-2.5 text-[11.5px] text-critical-ink">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            {ai && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex shrink-0 items-center gap-2 border-t border-hairline p-2.5"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์คำถาม…"
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl bg-fill px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="ส่งข้อความ"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white transition-opacity disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
