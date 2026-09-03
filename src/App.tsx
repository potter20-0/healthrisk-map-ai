import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Copy,
  Droplets,
  Link2,
  List,
  Map as MapIcon,
  Search,
  Share2,
  Siren,
  Sparkles,
  Users,
  Waves,
  Wind,
  X,
} from 'lucide-react';

import { VILLAGES, type Village } from './data';
import { cn } from './lib/utils';
import { RISK, RISK_ORDER, distanceKm, type RiskLevel } from './lib/risk';
import {
  FilterPill,
  NavButton,
  RiskDistribution,
  SatFeedItem,
  SectionTitle,
  StatTile,
  TimelineItem,
} from './components/primitives';
import { VillageCard } from './components/VillageCard';
import { VillageDetail } from './components/VillageDetail';
import { MapPanel, THAILAND_VIEW, type MapView } from './components/MapPanel';

type Tab = 'map' | 'list' | 'stats' | 'alerts';
type Filter = RiskLevel | 'all';

const ALERTS = [
  { time: '08:32 น.', text: 'PM2.5 เกินมาตรฐาน 3 เท่า — บ้านหนองผา จ.เชียงราย', level: 'critical' as const },
  { time: 'เมื่อวาน', text: 'รายงานอาการหายใจลำบาก 8 ราย — เขตภาคเหนือตอนบน', level: 'high' as const },
  { time: '2 วันก่อน', text: 'แจ้งเตือน อสม. พื้นที่เสี่ยงน้ำท่วมขัง 6 ตำบล', level: 'medium' as const },
  { time: '4 วันก่อน', text: 'ผลตรวจน้ำบาดาลผ่านเกณฑ์ — ภาคใต้ฝั่งอันดามัน', level: 'low' as const },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [selected, setSelected] = useState<Village | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<MapView>({ ...THAILAND_VIEW, nonce: 0 });
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Derived data ─────────────────────────────────────────── */

  const counts = useMemo(() => {
    const c: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const v of VILLAGES) c[v.risk]++;
    return c;
  }, []);

  const summary = useMemo(() => {
    const atRisk = VILLAGES.filter((v) => v.risk === 'critical' || v.risk === 'high');
    return {
      avgPm25: Math.round(VILLAGES.reduce((s, v) => s + v.pm25, 0) / VILLAGES.length),
      population: atRisk.reduce((s, v) => s + v.population, 0),
      unsafeWater: VILLAGES.filter((v) => v.water === 'Unsafe').length,
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VILLAGES.filter(
      (v) =>
        (filter === 'all' || v.risk === filter) &&
        (!q ||
          v.name.toLowerCase().includes(q) ||
          v.province.toLowerCase().includes(q) ||
          v.disease.toLowerCase().includes(q)),
    ).sort((a, b) => RISK[b.risk].rank - RISK[a.risk].rank || b.pm25 - a.pm25);
  }, [query, filter]);

  const distances = useMemo(() => {
    if (!userPos) return null;
    const m = new Map<number, number>();
    for (const v of VILLAGES) m.set(v.id, distanceKm(userPos, [v.lat, v.lng]));
    return m;
  }, [userPos]);

  /* ── Actions ──────────────────────────────────────────────── */

  const selectVillage = useCallback((v: Village) => {
    setSelected(v);
    setView((s) => ({ center: [v.lat, v.lng], zoom: 11, nonce: s.nonce + 1 }));
    if (window.innerWidth < 768) setActiveTab('map');
  }, []);

  const resetView = useCallback(() => {
    setSelected(null);
    setView((s) => ({ ...THAILAND_VIEW, nonce: s.nonce + 1 }));
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setUserPos(pos);
        const nearest = VILLAGES.reduce((best, v) =>
          distanceKm(pos, [v.lat, v.lng]) < distanceKm(pos, [best.lat, best.lng]) ? v : best,
        );
        selectVillage(nearest);
      },
      () => setView((s) => ({ ...THAILAND_VIEW, nonce: s.nonce + 1 })),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [selectVillage]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the QR code still works */
    }
  }, []);

  /* ── Shared fragments ─────────────────────────────────────── */

  const filterBar = (
    <div className="flex flex-wrap gap-1.5">
      <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} count={VILLAGES.length}>
        ทั้งหมด
      </FilterPill>
      {RISK_ORDER.map((lvl) => (
        <FilterPill
          key={lvl}
          active={filter === lvl}
          onClick={() => setFilter((f) => (f === lvl ? 'all' : lvl))}
          dot={RISK[lvl].hex}
          count={counts[lvl]}
        >
          {RISK[lvl].label}
        </FilterPill>
      ))}
    </div>
  );

  const searchBox = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาหมู่บ้าน จังหวัด หรือโรค…"
        className="w-full rounded-xl border border-line bg-surface-2 py-2.5 pl-9 pr-9 text-[13px] font-medium text-ink placeholder:text-ink-3 transition-colors focus:border-brand/40 focus:bg-surface focus:ring-2 focus:ring-brand/10"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label="ล้างการค้นหา"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-3 transition-colors hover:bg-line hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );

  const villageList = (empty: string) =>
    visible.length ? (
      visible.map((v) => (
        <VillageCard
          key={v.id}
          village={v}
          active={selected?.id === v.id}
          distance={distances?.get(v.id)}
          onClick={() => selectVillage(v)}
        />
      ))
    ) : (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface-2 px-4 py-10 text-center">
        <Search className="mx-auto mb-2 size-5 text-ink-3" />
        <p className="text-[13px] font-semibold text-ink-2">{empty}</p>
        <button
          onClick={() => {
            setQuery('');
            setFilter('all');
          }}
          className="mt-2 text-[11px] font-semibold text-brand hover:underline"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>
    );

  const feedsAndAlerts = (
    <>
      <section>
        <SectionTitle>ข้อมูลจากดาวเทียม</SectionTitle>
        <div className="space-y-2">
          <SatFeedItem
            icon={Wind}
            name="PM2.5 · Sentinel-5P"
            value={`ค่าเฉลี่ย ${summary.avgPm25} µg/m³`}
            status="ALERT"
            level="critical"
          />
          <SatFeedItem
            icon={Waves}
            name="น้ำท่วมขัง · GISTDA"
            value="ระดับปานกลาง 6 ตำบล"
            status="WATCH"
            level="medium"
          />
          <SatFeedItem
            icon={Droplets}
            name="คุณภาพน้ำผิวดิน"
            value={`ไม่ปลอดภัย ${summary.unsafeWater} จุด`}
            status="OK"
            level="low"
          />
        </div>
      </section>

      <section>
        <SectionTitle>การแจ้งเตือนล่าสุด</SectionTitle>
        <div className="relative space-y-4 before:absolute before:bottom-2 before:left-[4.5px] before:top-2 before:w-px before:bg-line">
          {ALERTS.map((a) => (
            <TimelineItem key={a.text} time={a.time} text={a.text} level={a.level} />
          ))}
        </div>
      </section>
    </>
  );

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-bg">
      {/* ── Header ── */}
      <header className="z-50 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/85 px-3 shadow-header backdrop-blur-xl md:h-16 md:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand-2 shadow-lg shadow-brand/20 md:size-10">
            <Activity className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold tracking-tight text-ink md:text-base">
              HealthRisk Map <span className="text-brand">AI</span>
            </h1>
            <p className="hidden text-[10px] font-medium text-ink-3 sm:block md:text-[11px]">
              ระบบแผนที่ความเสี่ยงสุขภาพชุมชนอัจฉริยะ
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] font-medium text-ink-2">
            <span className="size-1.5 animate-pulse rounded-full bg-risk-low" />
            LIVE {clock.toLocaleTimeString('th-TH')}
          </span>
          <span className="font-mono text-[11px] text-ink-3">
            หมู่บ้าน <span className="font-bold text-ink">{VILLAGES.length}</span>
          </span>
          <span className="font-mono text-[11px] text-ink-3">
            เสี่ยงสูง{' '}
            <span className="font-bold text-risk-critical">
              {counts.critical + counts.high}
            </span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setShowQR(true)}
            aria-label="แชร์แอป"
            className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 transition-all hover:border-line-strong hover:text-ink active:scale-95"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="relative flex flex-1 overflow-hidden">
        {/* Left rail — browse */}
        <aside className="hidden w-84 shrink-0 flex-col border-r border-line bg-surface md:flex">
          <div className="space-y-3 border-b border-line p-4">
            <SectionTitle>ภาพรวมความเสี่ยง</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <StatTile
                label="วิกฤต"
                value={counts.critical}
                level="critical"
                active={filter === 'critical'}
                onClick={() => setFilter((f) => (f === 'critical' ? 'all' : 'critical'))}
              />
              <StatTile
                label="สูง"
                value={counts.high}
                level="high"
                active={filter === 'high'}
                onClick={() => setFilter((f) => (f === 'high' ? 'all' : 'high'))}
              />
            </div>
            <RiskDistribution counts={counts} total={VILLAGES.length} />
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2">
              <Users className="size-4 shrink-0 text-brand" />
              <p className="text-[11px] font-medium leading-tight text-ink-2">
                ประชากรในพื้นที่เสี่ยงสูง{' '}
                <span className="font-mono font-bold text-ink">
                  {summary.population.toLocaleString('th-TH')}
                </span>{' '}
                คน
              </p>
            </div>
          </div>

          <div className="space-y-3 border-b border-line p-4">
            {searchBox}
            {filterBar}
          </div>

          <div className="thin-scroll flex-1 space-y-2.5 overflow-y-auto p-4">
            {villageList('ไม่พบหมู่บ้านที่ตรงกับเงื่อนไข')}
          </div>
        </aside>

        {/* Map */}
        <section
          className={cn(
            'relative flex-1',
            activeTab !== 'map' && 'hidden md:block',
          )}
        >
          <MapPanel
            villages={visible}
            selected={selected}
            view={view}
            userPos={userPos}
            onSelect={selectVillage}
            onLocate={locate}
            onReset={resetView}
            invalidateKey={activeTab}
          />

          {/* Mobile bottom sheet */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '110%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="absolute inset-x-3 bottom-3 z-20 lg:hidden"
              >
                <div className="thin-scroll max-h-[52vh] overflow-y-auto rounded-2xl border border-line bg-surface/95 p-4 shadow-float backdrop-blur-xl">
                  <VillageDetail
                    village={selected}
                    onClose={() => setSelected(null)}
                    compact
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right rail — detail / feeds */}
        <aside className="thin-scroll hidden w-80 shrink-0 flex-col space-y-5 overflow-y-auto border-l border-line bg-surface p-4 lg:flex">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <VillageDetail village={selected} onClose={() => setSelected(null)} />
              </motion.div>
            ) : (
              <motion.div
                key="feeds"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-dashed border-line-strong bg-surface-2 p-4 text-center">
                  <Sparkles className="mx-auto mb-1.5 size-5 text-brand" />
                  <p className="text-[12px] font-semibold text-ink">เลือกหมู่บ้านเพื่อดูรายละเอียด</p>
                  <p className="mt-0.5 text-[11px] text-ink-3">
                    คลิกจุดบนแผนที่ หรือรายการด้านซ้าย
                  </p>
                </div>
                {feedsAndAlerts}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Mobile — list */}
        {activeTab === 'list' && (
          <div className="thin-scroll flex-1 overflow-y-auto bg-bg md:hidden">
            <div className="sticky top-0 z-10 space-y-3 border-b border-line bg-surface/95 p-4 backdrop-blur-xl">
              {searchBox}
              <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
                {filterBar}
              </div>
            </div>
            <div className="space-y-2.5 p-4">
              {villageList('ไม่พบหมู่บ้านที่ตรงกับเงื่อนไข')}
            </div>
          </div>
        )}

        {/* Mobile — stats */}
        {activeTab === 'stats' && (
          <div className="thin-scroll flex-1 space-y-5 overflow-y-auto bg-bg p-4 md:hidden">
            <section className="rounded-2xl border border-line bg-surface p-4">
              <SectionTitle>ภาพรวมทั้งประเทศ</SectionTitle>
              <RiskDistribution counts={counts} total={VILLAGES.length} />
            </section>

            <div className="grid grid-cols-2 gap-3">
              <StatTile label="วิกฤต" value={counts.critical} level="critical" trend="+2" />
              <StatTile label="สูง" value={counts.high} level="high" trend="+5" />
              <StatTile label="ปานกลาง" value={counts.medium} level="medium" trend="-1" />
              <StatTile label="ต่ำ" value={counts.low} level="low" trend="-6" />
            </div>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-surface p-4">
                <Wind className="mb-2 size-4 text-risk-high" />
                <p className="font-mono text-2xl font-bold text-ink">{summary.avgPm25}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                  PM2.5 เฉลี่ย µg/m³
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <Users className="mb-2 size-4 text-brand" />
                <p className="font-mono text-2xl font-bold text-ink">
                  {(summary.population / 1000).toFixed(1)}K
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                  ประชากรเสี่ยงสูง
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-surface p-4">
              <SectionTitle>ประเด็นเฝ้าระวัง</SectionTitle>
              <div className="space-y-3">
                {[
                  {
                    icon: Wind,
                    level: 'critical' as const,
                    title: 'ความเสี่ยงระบบทางเดินหายใจ',
                    body: 'PM2.5 ภาคเหนือสูงต่อเนื่อง คาดการณ์ผู้ป่วยหอบหืดเพิ่มขึ้น',
                  },
                  {
                    icon: Waves,
                    level: 'high' as const,
                    title: 'เฝ้าระวังโรคฉี่หนู',
                    body: 'น้ำท่วมขังภาคอีสาน เสี่ยงสูงใน 6 ตำบล',
                  },
                  {
                    icon: Droplets,
                    level: 'medium' as const,
                    title: 'คุณภาพน้ำอุปโภคบริโภค',
                    body: `พบแหล่งน้ำไม่ปลอดภัย ${summary.unsafeWater} จุดทั่วประเทศ`,
                  },
                ].map(({ icon: Icon, level, title, body }) => (
                  <div key={title} className="flex gap-3">
                    <div
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl',
                        RISK[level].soft,
                      )}
                    >
                      <Icon className={cn('size-4', RISK[level].text)} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-ink">{title}</h4>
                      <p className="text-[11px] leading-snug text-ink-2">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Mobile — alerts */}
        {activeTab === 'alerts' && (
          <div className="thin-scroll flex-1 space-y-5 overflow-y-auto bg-bg p-4 md:hidden">
            {feedsAndAlerts}
          </div>
        )}
      </main>

      {/* ── Mobile nav ── */}
      <nav className="z-50 flex h-16 shrink-0 items-center gap-1 border-t border-line bg-surface/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <NavButton
          active={activeTab === 'map'}
          icon={MapIcon}
          label="แผนที่"
          onClick={() => setActiveTab('map')}
        />
        <NavButton
          active={activeTab === 'list'}
          icon={List}
          label="รายการ"
          onClick={() => setActiveTab('list')}
        />
        <NavButton
          active={activeTab === 'stats'}
          icon={BarChart3}
          label="สถิติ"
          onClick={() => setActiveTab('stats')}
        />
        <NavButton
          active={activeTab === 'alerts'}
          icon={Bell}
          label="เตือนภัย"
          badge={counts.critical}
          onClick={() => setActiveTab('alerts')}
        />
      </nav>

      {/* ── Share modal ── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQR(false)}
            className="fixed inset-0 z-100 flex items-center justify-center bg-ink/25 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center shadow-float"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">แชร์แอปพลิเคชัน</h2>
                <button
                  onClick={() => setShowQR(false)}
                  aria-label="ปิด"
                  className="rounded-full p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mb-5 inline-block rounded-2xl border border-line bg-white p-4">
                <QRCodeSVG value={window.location.href} size={188} level="M" fgColor="#0f172a" />
              </div>

              <p className="mb-5 text-[12px] font-medium leading-relaxed text-ink-2">
                สแกน QR code เพื่อเปิด HealthRisk Map AI บนมือถือของคุณ
              </p>

              <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2">
                <Link2 className="size-3.5 shrink-0 text-ink-3" />
                <span className="truncate font-mono text-[11px] text-ink-2">
                  {window.location.host}
                </span>
              </div>

              <button
                onClick={copyLink}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white transition-all active:scale-[0.98]',
                  copied ? 'bg-risk-low' : 'bg-brand hover:bg-brand/90',
                )}
              >
                <Copy className="size-4" />
                {copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical banner — mobile map only */}
      <AnimatePresence>
        {activeTab === 'map' && !selected && counts.critical > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none absolute inset-x-3 bottom-20 z-20 md:hidden"
          >
            <button
              onClick={() => setFilter('critical')}
              className="pointer-events-auto flex w-full items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/95 px-3.5 py-2.5 text-left shadow-float backdrop-blur"
            >
              <Siren className="size-4 shrink-0 text-risk-critical" />
              <p className="flex-1 text-[11px] font-semibold leading-tight text-red-800">
                พบพื้นที่ความเสี่ยงวิกฤต {counts.critical} แห่ง — แตะเพื่อกรองดูเฉพาะจุดเหล่านี้
              </p>
              <AlertTriangle className="size-4 shrink-0 text-risk-critical" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
