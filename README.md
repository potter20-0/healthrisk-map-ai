# HealthRisk Map AI

**ระบบแผนที่ความเสี่ยงสุขภาพชุมชนอัจฉริยะ** — an interactive map that visualizes
community health risk across 77 villages in Thailand, combining air quality,
water safety, and agricultural-chemical exposure into a single risk index.

🔗 **Live demo:** https://potter20-0.github.io/healthrisk-map-ai/

## Features

- **Risk map** — every village plotted on a light basemap, colour-coded by risk
  level, with pulsing markers on critical sites and a toggle between the
  Positron and terrain basemaps.
- **Search & filter** — find villages by name, province, or predicted disease;
  filters drive both the list and the map at once.
- **Composite risk index** — a 0–100 score weighting air 40% / water 30% /
  chemical 30%, shown as a gauge alongside PM2.5 bars measured against the
  25 µg/m³ safety threshold.
- **Geolocation** — locates the viewer, selects their nearest village, and shows
  per-village distances.
- **Responsive** — three-pane dashboard on desktop, tabbed navigation with a
  bottom-sheet detail view on mobile.

## Data

⚠️ All village data in [`src/data.ts`](src/data.ts) is **synthetic sample data**
built for a hackathon prototype. The satellite feed indicators (Sentinel-5P,
GISTDA) and the "AI Prediction" panel are illustrative mock-ups — the app makes
no live API calls, and nothing here should be used for real health decisions.

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Leaflet / react-leaflet ·
Motion · lucide-react

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # tsc --noEmit
```

## Deploying

The production build sets `base: '/healthrisk-map-ai/'`
(see [`vite.config.ts`](vite.config.ts)) so it can be served from a GitHub Pages
project page. If you host it elsewhere — at a domain root, for instance — change
that value to `'/'`.

## Licence

MIT
