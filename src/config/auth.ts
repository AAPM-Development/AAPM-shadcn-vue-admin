export const AUTH_CONFIG = {
  otpPrefix: 'S',
  title: 'AAPM Cloud ERP',
  /**
   * ERP identity extension: SSO/passkey buttons appear only once the integration is
   * implemented and enabled. Flip a provider to true when its backend exists.
   */
  sso: {
    github: false,
    google: false,
  },
} as const
