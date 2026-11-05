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
} as const
