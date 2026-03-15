# @zakkster/lite-theme-gen

[![npm version](https://img.shields.io/npm/v/@zakkster/lite-theme-gen.svg?style=for-the-badge&color=latest)](https://www.npmjs.com/package/@zakkster/lite-theme-gen)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zakkster/lite-theme-gen?style=for-the-badge)](https://bundlephobia.com/result?p=@zakkster/lite-theme-gen)
[![npm downloads](https://img.shields.io/npm/dm/@zakkster/lite-theme-gen?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-theme-gen)
[![npm total downloads](https://img.shields.io/npm/dt/@zakkster/lite-theme-gen?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-theme-gen)
![TypeScript](https://img.shields.io/badge/TypeScript-Types-informational)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Generate a complete design system from a single OKLCH brand color.

**One color in. Neutral scale, accent scale, semantic tokens, contrast-guaranteed text, and CSS custom properties out.**

## 🎬 Live Demo (ThemeGen)
https://codepen.io/editor/Zahari-Shinikchiev/full/019cea99-dcd8-714b-afce-4a9ffa85b114

## Why This Library?

- **One brand color → complete theme** — neutrals, accents, surfaces, borders, and text — all mathematically derived
- **Perceptually uniform** — built on OKLCH, not HSL. Same lightness = same perceived brightness.
- **Guaranteed contrast** — text colors are adjusted to meet minimum lightness deltas against their backgrounds
- **Light + dark mode** — flip a single option and get an inverted palette with the same brand feel
- **Tailwind-style scales** — 11-step ramps (50, 100–900, 950) for both neutral and accent
- **CSS-ready** — `toCssVariables()` generates a `:root { }` block you can inject directly

Depends on `@zakkster/lite-color` and `@zakkster/lite-lerp`.

## Installation

```bash
npm install @zakkster/lite-theme-gen @zakkster/lite-color @zakkster/lite-lerp
```

## Quick Start

```javascript
import { generateTheme, toCssVariables } from '@zakkster/lite-theme-gen';

const brand = { l: 0.65, c: 0.20, h: 40 };  // warm orange

const palette = generateTheme(brand, { mode: 'light' });
const css = toCssVariables(palette, { prefix: 'app', selector: ':root' });

// Inject into DOM
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
```

**Output:**
```css
:root {
  --app-neutral-50: oklch(0.9900 0.0050 55.00 / 1);
  --app-neutral-100: oklch(0.9412 0.0062 52.50 / 1);
  /* ... 20+ more variables ... */
  --app-text: oklch(0.1500 0.0200 25.00 / 1);
  --app-text-on-accent: oklch(0.9900 0.0000 0.00 / 1);
}
```

## One-Liner

```javascript
import { createThemeCss } from '@zakkster/lite-theme-gen';

const { palette, cssVars } = createThemeCss(
    { l: 0.65, c: 0.20, h: 40 },
    { mode: 'dark', prefix: 'dk', selector: '.dark' }
);
```

## Recipes

### Light + Dark Mode Toggle

```javascript
const brand = { l: 0.65, c: 0.20, h: 200 };  // ocean blue

const light = createThemeCss(brand, { mode: 'light', selector: ':root' });
const dark  = createThemeCss(brand, { mode: 'dark', selector: '.dark' });

document.head.innerHTML += `<style>${light.cssVars}\n${dark.cssVars}</style>`;

// Toggle: document.body.classList.toggle('dark');
```

### Dynamic Brand Color Picker

```javascript
colorPicker.addEventListener('input', () => {
    const brand = parseOklch(colorPicker.value); // from lite-color
    const { cssVars } = createThemeCss(brand);
    styleEl.textContent = cssVars;
});
```

### Accessing Semantic Tokens in JS

```javascript
const palette = generateTheme(brand);

// Use directly in Canvas rendering
ctx.fillStyle = toCssOklch(palette.accent);
ctx.strokeStyle = toCssOklch(palette.borderStrong);

// Check contrast
console.log('Text lightness:', palette.text.l);
console.log('BG lightness:', palette.bg.l);
console.log('Delta:', Math.abs(palette.text.l - palette.bg.l));
```

## API

### `generateTheme(brand, options?)`

Returns a palette object with 22+ color tokens.

| Option | Default | Description |
|--------|---------|-------------|
| `mode` | `'light'` | `'light'` or `'dark'` |
| `contrast` | `0.45` | Minimum lightness delta for text colors |
| `hueShift` | `15` | Hue rotation for highlights and shadows |

### `toCssVariables(palette, options?)`

Converts palette to a CSS custom properties block.

| Option | Default | Description |
|--------|---------|-------------|
| `prefix` | `'lt'` | CSS variable prefix |
| `selector` | `':root'` | CSS selector |

### `createThemeCss(brand, options?)`

One-liner combining both. Returns `{ palette, cssVars }`.

## Generated Tokens

**Scales:** `neutral-50` through `neutral-950`, `accent-50` through `accent-950` (11 steps each)

**Semantic:** `bg`, `bgMuted`, `surface`, `surfaceHover`, `borderSubtle`, `borderStrong`, `accent`, `accentHover`, `accentActive`, `accentSoftBg`, `accentSoftBorder`, `text`, `textMuted`, `textOnAccent`

## License

MIT
