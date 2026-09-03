/**
 * The OMNI Standard — the product-accent pattern (Level 2).
 *
 * Every product supplies exactly ONE hex value: its signature color.
 * Everything else in the six-token structure — hover, active, soft,
 * subtle, and the contrast (text/icon) color painted on top of it — is
 * derived here, by the same rule, for all eight products. No product
 * hand-tunes its own hover shade; that was the old, undocumented way.
 *
 * Usage (in each product's globals.css or a small generated file):
 *
 *   const { accentTokensToCssVars } = require('@omni/tokens');
 *   accentTokensToCssVars('#0B7A3E'); // Care
 *   // -> ":root{--omni-accent:11 122 62;--omni-accent-hover:...}"
 */

/** @param {string} hex */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** @param {[number,number,number]} rgb */
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

/** @param {[number,number,number]} hsl */
function hslToRgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0, gp = 0, bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255),
  ];
}

/** WCAG relative luminance. @param {[number,number,number]} rgb */
function relativeLuminance([r, g, b]) {
  const chan = (c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [chan(r), chan(g), chan(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG contrast ratio between two sRGB colors. */
function contrastRatio(rgbA, rgbB) {
  const lA = relativeLuminance(rgbA);
  const lB = relativeLuminance(rgbB);
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Derive the six-token accent structure from one base hex.
 * @param {string} baseHex
 * @returns {{accent:string, accentHover:string, accentActive:string, accentSoft:string, accentSubtle:string, accentContrast:string, meta:{contrastWithWhite:number, usedWhiteText:boolean}}}
 */
function buildProductAccentTokens(baseHex) {
  const rgb = hexToRgb(baseHex);
  const [h, s, l] = rgbToHsl(rgb);

  const hover = hslToRgb([h, s, clamp01(l - 0.06)]);
  const active = hslToRgb([h, s, clamp01(l - 0.11)]);
  // Soft: a solid, light tint — for badge fills, contextual alerts, chart series.
  // Pulled toward white in lightness, slightly desaturated, never fully alpha
  // (a badge background can't depend on whatever surface sits behind it).
  const soft = hslToRgb([h, clamp01(s * 0.85), clamp01(l + (1 - l) * 0.82)]);

  const white = [255, 255, 255];
  const ink = [24, 23, 26]; // --omni-ink
  const contrastWithWhite = contrastRatio(rgb, white);
  const usedWhiteText = contrastWithWhite >= 4.5;
  const contrast = usedWhiteText ? white : ink;

  return {
    accent: rgb.join(' '),
    accentHover: hover.join(' '),
    accentActive: active.join(' '),
    accentSoft: soft.join(' '),
    // Subtle stays the raw accent triple — consuming utilities apply their
    // own low alpha (e.g. bg-accent/8) for selected rows / selected nav items.
    accentSubtle: rgb.join(' '),
    accentContrast: contrast.join(' '),
    meta: { contrastWithWhite: Math.round(contrastWithWhite * 100) / 100, usedWhiteText },
  };
}

/**
 * Render the six tokens as a :root CSS block a product can inline once
 * (e.g. in app/layout.tsx's <style>, or written to a generated .css file
 * at build time). Keeping this as a function — not a static file per
 * product — is what keeps the pattern shared instead of forked.
 */
function accentTokensToCssVars(baseHex, selector = ':root') {
  const t = buildProductAccentTokens(baseHex);
  return `${selector}{--omni-accent:${t.accent};--omni-accent-hover:${t.accentHover};--omni-accent-active:${t.accentActive};--omni-accent-soft:${t.accentSoft};--omni-accent-subtle:${t.accentSubtle};--omni-accent-contrast:${t.accentContrast};}`;
}

module.exports = {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  contrastRatio,
  buildProductAccentTokens,
  accentTokensToCssVars,
};
