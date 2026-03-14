import type { OklchColor } from '@zakkster/lite-color';

export interface ThemeOptions {
    mode?: 'light' | 'dark';
    contrast?: number;
    hueShift?: number;
}

export interface CssVariableOptions {
    prefix?: string;
    selector?: string;
}

export interface ThemePalette {
    mode: string;
    brand: OklchColor;
    [key: string]: OklchColor | string;
}

export function generateTheme(brand: OklchColor, options?: ThemeOptions): ThemePalette;
export function toCssVariables(palette: ThemePalette, options?: CssVariableOptions): string;
export function createThemeCss(brand: OklchColor, options?: ThemeOptions & CssVariableOptions): {
    palette: ThemePalette;
    cssVars: string;
};
