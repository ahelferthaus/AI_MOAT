# AI MOAT Analyzer

Competitive Moat & AI Disruption Risk Analysis Tool for portfolio management.

## Structure

```
AI_MOAT/
├── webapp/                  # Desktop React/JSX web application
│   ├── moat_desktop.jsx     # Full desktop app (React + Recharts + FMP API)
│   └── moat_mobile.jsx      # Mobile-optimized version (preloaded data)
├── ios/                     # iOS Progressive Web App (Preact/htm)
│   ├── index.html           # Complete iOS PWA (assembled from chunks)
│   └── chunks/              # Development chunks for incremental building
│       ├── 01_scaffold.html # HTML shell + CSS + Preact/htm CDN + constants
│       ├── 02_compute.js    # Pure computation functions
│       ├── 03_charts.js     # Chart components (SVG radar, bars)
│       ├── 04_tables.js     # Data tables, ticker detail views
│       └── 05_app.js        # Main App component + state + mounting
├── docs/
│   └── CHUNKING_GUIDE.md    # How to work on this in parts
└── README.md
```

## iOS Conversion Strategy

The webapp is ~1,020 lines of React/JSX using Recharts. The iOS version converts to:
- **Preact + htm** (no build step, CDN-loaded)
- **Inline SVG charts** (replacing Recharts)
- **Single HTML file** PWA that works offline on iOS

### Working in Chunks

Each chunk in `ios/chunks/` can be worked on in a separate Claude conversation.
See `docs/CHUNKING_GUIDE.md` for the step-by-step process.

## Tech Stack

| Layer | Webapp | iOS |
|-------|--------|-----|
| Framework | React 18 | Preact 10 + htm |
| Charts | Recharts | Inline SVG |
| Data | FMP API live | Preloaded JSON |
| Styling | Inline CSS-in-JS | Embedded `<style>` |
| Hosting | Claude Artifact / Vercel | GitHub Pages / PWA |
