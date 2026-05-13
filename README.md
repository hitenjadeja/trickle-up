# Trickle Up

> The economy you weren't told about.

**Live at <https://hitenjadeja.github.io/trickle-up/>**

An interactive, scroll-driven 10-minute story about wealth inequality, framed by the analysis of Gary Stevenson (Gary's Economics). British English, dark theme, mobile and desktop.

## Run locally

No build step. Open `index.html` directly in a browser, or serve the folder:

```bash
# Python
python3 -m http.server 8000

# Node (any static server, e.g. http-server)
npx http-server -p 8000
```

Then open `http://localhost:8000`.

## Hosting

Drop the folder on any static host:

- Netlify (drag-and-drop the folder)
- GitHub Pages (push to a `gh-pages` branch)
- Vercel (deploy as a static project)
- Cloudflare Pages

## What's in the box

| Path | Purpose |
| --- | --- |
| `index.html` | Single-page shell with all 8 chapter sections |
| `styles/theme.css` | Design tokens (colours, type, spacing) |
| `styles/layout.css` | Header, sections, mobile breakpoints |
| `styles/components.css` | Buttons, cards, sliders, tooltips |
| `styles/chapters.css` | Per-chapter layout overrides |
| `scripts/state.js` | Role state + localStorage |
| `scripts/roles.js` | 5 role definitions, icons as DOM nodes |
| `scripts/scroll.js` | GSAP ScrollTrigger orchestration |
| `scripts/chapter-roles.js` | Ch 1 - role picker |
| `scripts/chapter-two-kinds.js` | Ch 2 - wages vs assets |
| `scripts/chapter-flow.js` | Ch 3 - animated Sankey |
| `scripts/chapter-debt.js` | Ch 4 - debt ownership diagram |
| `scripts/chapter-pullaway.js` | Ch 5 - compound growth race |
| `scripts/chapter-squeeze.js` | Ch 6 - role-aware squeeze |
| `scripts/chapter-tax.js` | Ch 7 - tax calculator |
| `scripts/chapter-fix.js` | Ch 8 - asset simulator + share |
| `assets/logo.svg` | Trickle Up wordmark |
| `assets/favicon.svg` | Browser tab icon |

## Dependencies

All loaded via CDN, no install required:

- D3.js 7 and d3-sankey 0.12 - charts and Sankey
- GSAP 3 with ScrollTrigger - scroll animations
- Inter + IBM Plex Mono - typography (Google Fonts)

## A note on the numbers

The figures used in the simulators are illustrative round numbers, chosen so the underlying maths is visible. They are inspired by analysis from Gary Stevenson and broad public data on UK income, wealth, and tax distribution. They are not forecasts.

## Accessibility

- Semantic HTML, keyboard-navigable interactions
- WCAG AA contrast on the dark theme
- Respects `prefers-reduced-motion`
- Screen-reader friendly chart labels via `aria-label`

## Credits

Inspired by the work of Gary Stevenson (Gary's Economics) on YouTube and in his book *The Trading Game*.

## Licence

Personal / educational use. Adapt freely.
