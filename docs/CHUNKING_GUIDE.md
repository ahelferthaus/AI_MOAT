# iOS Conversion — Chunking Guide

## Problem
The full webapp is ~1,020 lines. Converting to Preact/htm touches every line of JSX.
This exceeds Claude's context window for a single session.

## Solution: 5-Chunk Conversion

### Chunk 1: Scaffold (`01_scaffold.html`)
**What**: HTML shell, `<meta>` viewport, Preact/htm CDN imports, all CSS in `<style>`, 
color constants, sector database, and a placeholder `<div id="app">Loading...</div>`.

**How to request**: 
> "Create the iOS scaffold. Preact + htm from CDN, all CSS inlined, dark theme, 
> constants and SECTOR_DB defined. No components yet — just renders 'Loading...' on iOS."

**Size**: ~200 lines

---

### Chunk 2: Computation Functions (`02_compute.js`)
**What**: All pure JS functions — `calcMoat`, `calcAI`, `CAP`, `adjCAP`, `aiPrem`, 
`justPE`, `tier`, `computeAll`, `computeSComp`.

**How to request**:
> "Convert these computation functions to work with Preact. They're pure JS so mostly 
> copy-paste. Attach: 01_scaffold.html + original desktop.jsx lines 25-120."

**Size**: ~100 lines

---

### Chunk 3: Chart Components (`03_charts.js`)
**What**: SVG replacements for Recharts — RadarChart, BarChart, composed charts. 
These need the biggest rewrite since Recharts doesn't run without React/bundler.

**How to request**:
> "Convert these Recharts components to inline SVG using htm template literals. 
> Attach: scaffold + compute chunk + the original chart JSX."

**Size**: ~250 lines

---

### Chunk 4: Data Tables (`04_tables.js`)
**What**: SubsecTable, ticker detail view, wiki/description panels, 
override editing UI.

**How to request**:
> "Convert these table/detail components to Preact/htm. 
> Attach: scaffold + the original table JSX sections."

**Size**: ~200 lines

---

### Chunk 5: Main App + Assembly (`05_app.js`)
**What**: Main `App` component with all state management, tab switching, 
data loading, event handlers. Wire everything together and mount.

**How to request**:
> "Convert the main App component to Preact/htm and assemble all chunks into 
> the final index.html. Attach: all 4 previous chunks + original App JSX."

**Size**: ~300 lines

---

## Assembly

After all 5 chunks are complete:

```bash
# The final ios/index.html is assembled by inserting chunks 2-5 
# into the scaffold's <script> tag, in order.
# Chunk 5 conversation should produce the final assembled file.
```

## Tips

1. **Start each chat** with: "Continue iOS conversion. Working on Chunk N. 
   Here's what's done so far: [attach previous chunks]"
2. **Don't re-read the original** — attach both the original section AND 
   the in-progress conversion
3. **Say "save progress"** if a chat gets long — Claude will output what's done
4. **Test each chunk** by pasting into the scaffold and checking for errors
5. **Git commit after each chunk** — `git add ios/chunks/0N_*.* && git commit -m "Chunk N: description"`
