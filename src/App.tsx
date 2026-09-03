import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart3,
  Bell,
  Check,
  Copy,
  Droplets,
  List,
  Map as MapIcon,
  Search,
  Share2,
  Waves,
  Wind,
  X,
} from 'lucide-react';

import { VILLAGES, type Village } from './data';
import { cn } from './lib/utils';
import { RISK, RISK_ORDER, distanceKm, type RiskLevel } from './lib/risk';
import {
  BigStat,
  CountChip,
  FeedRow,
  NavButton,
  RiskDistribution,
  SectionTitle,
  Segmented,
  TimelineItem,
} from './components/primitives';
import { LogoTile, Wordmark } from './components/Logo';
import { VillageCard } from './components/VillageCard';
import { VillageDetail } from './components/VillageDetail';
import { MapPanel, THAILAND_VIEW, type MapView } from './components/MapPanel';

type Tab = 'map' | 'list' | 'stats' | 'alerts';
type Filter = RiskLevel | 'all';

const ALERTS = [
  {
    time: 'วันนี้ 08:32 น.',
    text: 'PM2.5 เกินมาตรฐาน 3 เท่า — บ้านหนองผา จ.เชียงราย',
    level: 'critical' as const,
  },
  {
    time: 'เมื่อวาน',
    text: 'รายงานอาการหายใจลำบาก 8 ราย — ภาคเหนือตอนบน',
    level: 'high' as const,
  },
  {
    time: '2 วันก่อน',
    text: 'แจ้งเตือน อสม. พื้นที่เสี่ยงน้ำท่วมขัง 6 ตำบล',
    level: 'medium' as const,
  },
  {
    time: '4 วันก่อน',
    text: 'ผลตรวจน้ำบาดาลผ่านเกณฑ์ — ภาคใต้ฝั่งอันดามัน',
    level: 'low' as const,
  },
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

  /* ── Derived ──────────────────────────────────────────────── */

  const counts = useMemo(() => {
    const c: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const v of VILLAGES) c[v.risk]++;
    return c;
  }, []);

  const summary = useMemo(() => {
    const atRisk = VILLAGES.filter((v) => v.risk === 'critical' || v.risk === 'high');
    return {
      atRiskCount: atRisk.length,
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQR) setShowQR(false);
        else if (selected) setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQR, selected]);

  /* ── Fragments ────────────────────────────────────────────── */

  const filterOptions = useMemo(
    () => [
      { value: 'all' as Filter, label: 'ทั้งหมด', count: VILLAGES.length },
      ...RISK_ORDER.map((lvl) => ({
        value: lvl as Filter,
        label: RISK[lvl].label,
        dot: RISK[lvl].hex,
        count: counts[lvl],
      })),
    ],
    [counts],
  );

  const searchBox = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาหมู่บ้าน จังหวัด หรือโรค"
        className="w-full rounded-xl bg-fill py-2.5 pl-9 pr-9 text-[13px] text-ink transition-all placeholder:text-ink-3 focus:bg-surface focus:ring-2 focus:ring-brand/25"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label="ล้างการค้นหา"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-3 transition-colors hover:bg-hairline hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );

  const villageList = (
    <div className="space-y-0.5">
      {visible.length ? (
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
        <div className="px-4 py-14 text-center">
          <p className="text-[13px] font-medium text-ink">ไม่พบหมู่บ้านที่ตรงกับเงื่อนไข</p>
          <button
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
            className="mt-1.5 text-[12px] font-medium text-brand hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}
    </div>
  );

  const feedsAndAlerts = (
    <>
      <section>
        <SectionTitle className="mb-1">ข้อมูลจากดาวเทียม</SectionTitle>
        <div className="divide-y divide-hairline">
          <FeedRow
            icon={Wind}
            name="ฝุ่น PM2.5"
            value={`Sentinel-5P · เฉลี่ย ${summary.avgPm25} µg/m³`}
            status="ALERT"
            level="critical"
          />
          <FeedRow
            icon={Waves}
            name="น้ำท่วมขัง"
            value="GISTDA · ระดับปานกลาง 6 ตำบล"
            status="WATCH"
            level="medium"
          />
          <FeedRow
            icon={Droplets}
            name="คุณภาพน้ำผิวดิน"
            value={`ไม่ปลอดภัย ${summary.unsafeWater} จุด`}
            status="OK"
            level="low"
          />
        </div>
      </section>

      <section>
        <SectionTitle className="mb-3">การแจ้งเตือนล่าสุด</SectionTitle>
        <div className="space-y-3.5">
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
      <header className="z-50 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-surface px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <LogoTile className="size-8 shrink-0" />
          <span className="min-w-0 truncate">
            <Wordmark />
          </span>
          <span className="ml-1 hidden rounded-md bg-brand-bg px-1.5 py-0.5 text-[10px] font-semibold text-brand sm:inline">
            AI
          </span>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <span className="text-[12px] text-ink-2">
            <span className="font-mono font-semibold text-ink">{VILLAGES.length}</span> หมู่บ้าน
          </span>
          <span className="h-3.5 w-px bg-hairline" />
          <span className="text-[12px] text-ink-2">
            เฝ้าระวัง{' '}
            <span className="font-mono font-semibold text-critical-ink">
              {summary.atRiskCount}
            </span>
          </span>
        </div>

        <button
          onClick={() => setShowQR(true)}
          aria-label="แชร์แอป"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-fill hover:text-ink"
        >
          <Share2 className="size-[1.05rem]" />
        </button>
      </header>

      {/* ── Body ── */}
      <main className="relative flex flex-1 overflow-hidden">
        {/* Left rail */}
        <aside className="hidden w-84 shrink-0 flex-col border-r border-hairline bg-surface md:flex">
          {/* Hero — one big number, not four equal tiles */}
          <div className="px-4 pb-4 pt-5">
            <BigStat
              value={summary.atRiskCount}
              label="หมู่บ้านที่ต้องเฝ้าระวัง"
              sub={`ประชากร ${summary.population.toLocaleString('th-TH')} คน`}
              level="critical"
            />
            <div className="mt-4">
              <RiskDistribution counts={counts} total={VILLAGES.length} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-0.5">
              {RISK_ORDER.map((lvl) => (
                <CountChip
                  key={lvl}
                  level={lvl}
                  value={counts[lvl]}
                  active={filter === lvl}
                  onClick={() => setFilter((f) => (f === lvl ? 'all' : lvl))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2.5 border-t border-hairline px-4 py-3.5">
            {searchBox}
            <Segmented<Filter> options={filterOptions} value={filter} onChange={setFilter} />
          </div>

          <div className="thin-scroll flex-1 overflow-y-auto px-2 pb-4 pt-1">{villageList}</div>
        </aside>

        {/* Map */}
        <section className={cn('relative flex-1', activeTab !== 'map' && 'hidden md:block')}>
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

          {/* Mobile / tablet sheet */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '110%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="absolute inset-x-3 bottom-3 z-20 lg:hidden"
              >
                <div className="thin-scroll max-h-[54vh] overflow-y-auto rounded-2xl bg-surface/97 p-4 shadow-float ring-1 ring-hairline backdrop-blur-xl">
                  <VillageDetail village={selected} onClose={() => setSelected(null)} compact />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right rail */}
        <aside className="thin-scroll hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-hairline bg-surface lg:flex">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="p-4"
              >
                <VillageDetail village={selected} onClose={() => setSelected(null)} />
              </motion.div>
            ) : (
              <motion.div
                key="feeds"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="space-y-6 p-4"
              >
                <div className="rounded-xl bg-fill px-4 py-5 text-center">
                  <p className="text-[12.5px] font-medium text-ink">เลือกหมู่บ้านเพื่อดูรายละเอียด</p>
                  <p className="mt-0.5 text-[11px] text-ink-3">คลิกจุดบนแผนที่ หรือรายการด้านซ้าย</p>
                </div>
                {feedsAndAlerts}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Mobile — list */}
        {activeTab === 'list' && (
          <div className="thin-scroll flex-1 overflow-y-auto bg-surface md:hidden">
            <div className="sticky top-0 z-10 space-y-2.5 border-b border-hairline bg-surface/95 px-4 py-3 backdrop-blur-xl">
              {searchBox}
              <Segmented<Filter> options={filterOptions} value={filter} onChange={setFilter} />
            </div>
            <div className="px-2 py-2">{villageList}</div>
          </div>
        )}

        {/* Mobile — stats */}
        {activeTab === 'stats' && (
          <div className="thin-scroll flex-1 overflow-y-auto bg-bg">
            <div className="space-y-3 bg-surface px-4 pb-5 pt-6">
              <BigStat
                value={summary.atRiskCount}
                label="หมู่บ้านที่ต้องเฝ้าระวัง"
                sub={`จากทั้งหมด ${VILLAGES.length} หมู่บ้าน`}
                level="critical"
              />
              <RiskDistribution counts={counts} total={VILLAGES.length} />
              <div className="grid grid-cols-4 gap-0.5 pt-1">
                {RISK_ORDER.map((lvl) => (
                  <CountChip
                    key={lvl}
                    level={lvl}
                    value={counts[lvl]}
                    active={filter === lvl}
                    onClick={() => {
                      setFilter((f) => (f === lvl ? 'all' : lvl));
                      setActiveTab('list');
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 bg-surface px-4 py-5">
              <div>
                <BigStat value={summary.avgPm25} label="PM2.5 เฉลี่ย" sub="µg/m³ ทั่วประเทศ" />
              </div>
              <div>
                <BigStat
                  value={`${(summary.population / 1000).toFixed(1)}K`}
                  label="ประชากรเสี่ยงสูง"
                  sub="ในพื้นที่เฝ้าระวัง"
                />
              </div>
            </div>

            <div className="mt-2 space-y-6 bg-surface px-4 py-5">{feedsAndAlerts}</div>
          </div>
        )}

        {/* Mobile — alerts */}
        {activeTab === 'alerts' && (
          <div className="thin-scroll flex-1 space-y-6 overflow-y-auto bg-surface p-4 md:hidden">
            {feedsAndAlerts}
          </div>
        )}
      </main>

      {/* ── Mobile nav ── */}
      <nav className="z-50 flex h-15 shrink-0 items-center gap-1 border-t border-hairline bg-surface px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
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
            className="fixed inset-0 z-100 grid place-items-center bg-ink/20 p-4 backdrop-blur-[3px]"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-76 rounded-2xl bg-surface p-5 shadow-float"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <LogoTile className="size-7 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold tracking-tight text-ink">
                    แชร์แอปพลิเคชัน
                  </p>
                  <p className="truncate font-mono text-[10.5px] text-ink-3">
                    {window.location.host}
                  </p>
                </div>
                <button
                  onClick={() => setShowQR(false)}
                  aria-label="ปิด"
                  className="-mr-1 shrink-0 rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-fill hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid place-items-center rounded-xl bg-fill py-6">
                <QRCodeSVG
                  value={window.location.href}
                  size={168}
                  level="M"
                  fgColor="#0b1220"
                  bgColor="transparent"
                />
              </div>

              <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-2">
                สแกนเพื่อเปิดบนมือถือ
              </p>

              <button
                onClick={copyLink}
                className={cn(
                  'mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all active:scale-[0.985]',
                  copied
                    ? 'bg-low-bg text-low-ink'
                    : 'bg-ink text-white hover:bg-ink/90',
                )}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
