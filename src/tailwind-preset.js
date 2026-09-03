/**
 * The OMNI Standard — Tailwind preset.
 *
 * Every product repo adds this as a `presets` entry (not a copy-pasted
 * theme block) so the enforcement lives in one place:
 *
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require('@omni/tokens/tailwind-preset')],
 *     content: [...],
 *   }
 *
 * Two of these overrides are deliberately restrictive, not just additive:
 * borderRadius and boxShadow collapse Tailwind's default scale down to the
 * doc's actual values, so `rounded-2xl` or `shadow-xl` can no longer
 * silently reintroduce a 16px bubble or a floating-card shadow — the
 * classes still work, they just can't produce the wrong number anymore.
 * This is Step 7's drift prevention starting at the source, not just a
 * lint rule bolted on after the fact.
 *
 * Spacing is intentionally NOT overridden: Tailwind's default scale is
 * already a 4px base (space-1 = 4px, space-2 = 8px, ... space-14 = 56px,
 * space-20 = 80px) and lines up with the doc's --sp-1..--sp-10 exactly.
 * Redefining it here would just be busywork with a collision risk.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        omni: {
          bg: 'rgb(var(--omni-bg) / <alpha-value>)',
          surface: 'rgb(var(--omni-surface) / <alpha-value>)',
          'surface-sunk': 'rgb(var(--omni-surface-sunk) / <alpha-value>)',
          border: 'rgb(var(--omni-border) / <alpha-value>)',
          'border-strong': 'rgb(var(--omni-border-strong) / <alpha-value>)',
          ink: 'rgb(var(--omni-ink) / <alpha-value>)',
          'ink-soft': 'rgb(var(--omni-ink-soft) / <alpha-value>)',
          'ink-faint': 'rgb(var(--omni-ink-faint) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--omni-success) / <alpha-value>)',
          soft: 'rgb(var(--omni-success-soft) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--omni-warning) / <alpha-value>)',
          soft: 'rgb(var(--omni-warning-soft) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--omni-error) / <alpha-value>)',
          soft: 'rgb(var(--omni-error-soft) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--omni-info) / <alpha-value>)',
          soft: 'rgb(var(--omni-info-soft) / <alpha-value>)',
        },
        // Level 2 — the product's own six-token accent. The hex is supplied
        // per product via product-accents.js; this preset only wires the
        // CSS variable names to Tailwind utility names, identically for all eight.
        accent: {
          DEFAULT: 'rgb(var(--omni-accent) / <alpha-value>)',
          hover: 'rgb(var(--omni-accent-hover) / <alpha-value>)',
          active: 'rgb(var(--omni-accent-active) / <alpha-value>)',
          soft: 'rgb(var(--omni-accent-soft) / <alpha-value>)',
          subtle: 'rgb(var(--omni-accent-subtle) / <alpha-value>)',
          contrast: 'rgb(var(--omni-accent-contrast) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Familjen Grotesk"', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        // [fontSize, { lineHeight, fontWeight?, letterSpacing? }] — matches
        // the doc's type-scale table exactly. Mobile step-down (48→32 etc.)
        // is applied per-component with responsive variants (text-display
        // md:text-[48px]), not baked in here, since the base scale is the
        // mobile-first floor.
        display: ['32px', { lineHeight: '1.08', fontWeight: '600', letterSpacing: '-0.015em' }],
        h1: ['24px', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.01em' }],
        h2: ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        // Desktop sizes, applied with a breakpoint: text-display md:text-display-lg.
        // Named, not arbitrary — "text-[48px]" scattered through components is
        // exactly the kind of drift Step 7 is supposed to catch.
        'display-lg': ['48px', { lineHeight: '1.08', fontWeight: '600', letterSpacing: '-0.015em' }],
        'h1-lg': ['30px', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h2-lg': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6' }],
        small: ['14px', { lineHeight: '1.5' }],
        caption: ['13px', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        data: ['15px', { lineHeight: '1.1', fontWeight: '500' }],
      },
      borderRadius: {
        none: '0px',
        sm: '6px',
        DEFAULT: '6px',
        md: '6px',
        lg: '10px',
        xl: '10px',
        '2xl': '10px',
        '3xl': '10px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        sm: 'var(--omni-shadow-1)',
        DEFAULT: 'var(--omni-shadow-1)',
        md: 'var(--omni-shadow-2)',
        lg: 'var(--omni-shadow-2)',
        xl: 'var(--omni-shadow-2)',
        '2xl': 'var(--omni-shadow-2)',
      },
      // Tailwind's default opacity scale has no "8" stop (0,5,10,20,25,30,
      // 40,50,60,70,75,80,90,95,100) — so bg-accent-subtle/8, used
      // throughout the component layer for the doc's "subtle" tier wash,
      // silently generated nothing without this. Found by actually
      // compiling the preset against real component source, not assumed.
      opacity: {
        8: '0.08',
      },
      transitionDuration: {
        DEFAULT: '120ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
};
