export const SITE_CONFIG = {
  name: 'AAPM Admin',
  company: 'PT Agung Abadi Putra Mandiri',
  /** Compact rooster mark. `dark` is the official dark-surface master, never a CSS invert. */
  logo: {
    light: '/brand/aapm-icon.svg',
    dark: '/brand/aapm-icon-dark.svg',
  },
  /** Horizontal lockup (mark + wordmark). */
  lockup: {
    light: '/brand/aapm-logo.svg',
    dark: '/brand/aapm-logo-dark.svg',
  },
  /**
   * "AAPM Cloud ERP" product lockups (official SVG masters supplied by AAPM, Asset 23–26).
   * `light` = full colour for light surfaces, `dark` = white for dark surfaces (and the green bumper).
   */
  erp: {
    horizontal: {
      light: '/brand/aapm-cloud-erp-horizontal.svg',
      dark: '/brand/aapm-cloud-erp-horizontal-white.svg',
    },
    stacked: {
      light: '/brand/aapm-cloud-erp-stacked.svg',
      dark: '/brand/aapm-cloud-erp-stacked-white.svg',
    },
  },
} as const
