export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB;
export function rgbToHsl(rgb: RGB): [number, number, number];
export function hslToRgb(hsl: [number, number, number]): RGB;
export function relativeLuminance(rgb: RGB): number;
export function contrastRatio(rgbA: RGB, rgbB: RGB): number;

export interface ProductAccentTokens {
  accent: string;
  accentHover: string;
  accentActive: string;
  accentSoft: string;
  accentSubtle: string;
  accentContrast: string;
  meta: { contrastWithWhite: number; usedWhiteText: boolean };
}

export function buildProductAccentTokens(baseHex: string): ProductAccentTokens;
export function accentTokensToCssVars(baseHex: string, selector?: string): string;

export const PRODUCTS: {
  care: string;
  pay: string;
  queue: string;
  rewards: string;
  share: string;
  sports: string;
  talent: string;
  vendor: string;
};
