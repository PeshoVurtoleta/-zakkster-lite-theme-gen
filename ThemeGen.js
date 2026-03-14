/**
 * @zakkster/lite-theme-gen — Professional OKLCH Theme Generation
 *
 * Generates a complete design system from a single OKLCH brand color.
 * Produces Tailwind-style 11-step neutral and accent scales, semantic tokens,
 * and guaranteed-contrast text colors.
 *
 * Powered by @zakkster/lite-color and @zakkster/lite-lerp.
 */

import { createGradient, toCssOklch } from '@zakkster/lite-color';
import { clamp, easeOut } from '@zakkster/lite-lerp';

/**
 * Ensure minimum lightness contrast between text and background.
 * Adjusts text lightness if the delta is below the threshold.
 * @private
 */
const ensureContrastOklch = (textColor, bgColor, minDelta = 0.45) => {
    const out = { ...textColor };
    const currentDelta = Math.abs(out.l - bgColor.l);

    if (currentDelta < minDelta) {
        out.l = bgColor.l > 0.5
            ? clamp(bgColor.l - minDelta, 0, 1)
            : clamp(bgColor.l + minDelta, 0, 1);
    }
    return out;
};

/**
 * Generate a complete theme palette from a single brand color.
 *
 * @param {{ l: number, c: number, h: number }} brand  OKLCH brand color
 * @param {Object}  [options]
 * @param {string}  [options.mode='light']     'light' or 'dark'
 * @param {number}  [options.contrast=0.45]    Minimum lightness delta for text
 * @param {number}  [options.hueShift=15]      Hue rotation for highlights/shadows
 * @returns {Object} Palette with neutral-50..950, accent-50..950, and semantic tokens
 */
export function generateTheme(brand, options = {}) {
    if (!brand || typeof brand.l !== 'number' || typeof brand.c !== 'number' || typeof brand.h !== 'number') {
        throw new Error('lite-theme-gen: brand must be an OKLCH object with { l, c, h }');
    }

    const mode     = options.mode || 'light';
    const contrast = options.contrast || 0.45;
    const hueShift = options.hueShift || 15;
    const isLight  = mode === 'light';

    // 1. Neutral scale — subtle brand tinting in the grays
    const neutralGradient = createGradient([
        { l: 0.99, c: 0.005, h: brand.h + hueShift },
        { l: 0.50, c: 0.015, h: brand.h },
        { l: 0.10, c: 0.020, h: brand.h - hueShift },
    ], easeOut);

    // 2. Accent scale — full-saturation brand ramp
    const accentGradient = createGradient([
        { l: 0.96, c: brand.c * 0.1, h: brand.h + hueShift },
        brand,
        { l: 0.15, c: brand.c * 0.4, h: brand.h - hueShift },
    ], easeOut);

    // 3. Generate 11-step scales (Tailwind convention: 50, 100–900, 950)
    const steps = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const palette = { mode, brand };

    steps.forEach((stop, i) => {
        const stepName = i === 0 ? '50' : i === 10 ? '950' : `${i * 100}`;
        const t = isLight ? stop : 1 - stop;

        palette[`neutral-${stepName}`] = neutralGradient(t);
        palette[`accent-${stepName}`]  = accentGradient(t);
    });

    // 4. Semantic tokens
    const hoverT  = isLight ? 0.65 : 0.35;
    const activeT = isLight ? 0.75 : 0.25;
    const softBgT = isLight ? 0.10 : 0.90;
    const softBdT = isLight ? 0.30 : 0.70;

    palette.bg           = palette['neutral-50'];
    palette.bgMuted      = palette['neutral-100'];
    palette.surface      = palette['neutral-200'];
    palette.surfaceHover = palette['neutral-300'];

    palette.borderSubtle = palette['neutral-300'];
    palette.borderStrong = palette['neutral-400'];

    palette.accent           = brand;
    palette.accentHover      = accentGradient(hoverT);
    palette.accentActive     = accentGradient(activeT);
    palette.accentSoftBg     = accentGradient(softBgT);
    palette.accentSoftBorder = accentGradient(softBdT);

    // 5. Contrast-guaranteed text colors
    const rawText      = palette['neutral-900'];
    const rawTextMuted = palette['neutral-600'];

    palette.text      = ensureContrastOklch(rawText, palette.bg, contrast);
    palette.textMuted = ensureContrastOklch(rawTextMuted, palette.bg, contrast - 0.15);

    const textOnAccentBase = isLight ? { l: 0.99, c: 0, h: 0 } : { l: 0.1, c: 0, h: 0 };
    palette.textOnAccent = ensureContrastOklch(textOnAccentBase, palette.accent, contrast);

    return palette;
}

/**
 * Convert a palette to CSS custom properties.
 *
 * @param {Object} palette     Output from generateTheme()
 * @param {Object} [options]
 * @param {string} [options.prefix='lt']       CSS variable prefix
 * @param {string} [options.selector=':root']  CSS selector
 * @returns {string} CSS block with custom properties
 */
export function toCssVariables(palette, { prefix = 'lt', selector = ':root' } = {}) {
    const entries = Object.entries(palette).filter(([k]) => k !== 'mode' && k !== 'brand');

    const lines = entries.map(([key, color]) => {
        const cssKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        return `  --${prefix}-${cssKey}: ${toCssOklch(color)};`;
    });

    return `${selector} {\n${lines.join('\n')}\n}`;
}

/**
 * One-liner: generate theme + CSS variables.
 *
 * @param {{ l: number, c: number, h: number }} brand
 * @param {Object} [options]  Merged options for generateTheme + toCssVariables
 * @returns {{ palette: Object, cssVars: string }}
 */
export function createThemeCss(brand, options = {}) {
    const palette = generateTheme(brand, options);
    const cssVars = toCssVariables(palette, options);
    return { palette, cssVars };
}
