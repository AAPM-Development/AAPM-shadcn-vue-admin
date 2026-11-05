import type { NavGroup, NavItem } from '@/components/app-sidebar/types'

import { ICONS } from '@/components/aapm/icon/registry'

type SidebarLink = Extract<NavItem, { url: string }>

export const settingsNavItems: SidebarLink[] = [
  { title: 'Profil', url: '/settings/', icon: ICONS.profile },
  { title: 'Akun', url: '/settings/account', icon: ICONS.account },
  { title: 'Tampilan', url: '/settings/appearance', icon: ICONS.appearance },
  { title: 'Notifikasi', url: '/settings/notifications', icon: ICONS.notification },
  { title: 'Layar', url: '/settings/display', icon: ICONS.display },
]

export const navData: NavGroup[] = [
  {
    title: 'Operasional',
    items: [
      { title: 'Ringkasan farm', url: '/dashboard', icon: ICONS.dashboard },
      { title: 'Tugas', url: '/tasks', icon: ICONS.tasks },
      { title: 'Aplikasi', url: '/apps', icon: ICONS.apps },
      { title: 'Pengguna', url: '/users', icon: ICONS.users },
      { title: 'Asisten AI', url: '/ai-talk', icon: ICONS.ai },
    ],
  },
  {
    title: 'Halaman',
    items: [
      {
        title: 'Autentikasi',
        icon: ICONS.auth,
        items: [
          { title: 'Masuk', url: '/auth/sign-in' },
          { title: 'Masuk (2 kolom)', url: '/auth/sign-in-2' },
          { title: 'Daftar', url: '/auth/sign-up' },
          { title: 'Lupa kata sandi', url: '/auth/forgot-password' },
          { title: 'OTP', url: '/auth/otp' },
        ],
      },
      {
        title: 'Halaman galat',
        icon: ICONS.errors,
        items: [
          { title: '401 · Tidak berwenang', url: '/errors/401' },
          { title: '403 · Akses ditolak', url: '/errors/403' },
          { title: '404 · Tidak ditemukan', url: '/errors/404' },
          { title: '500 · Galat server', url: '/errors/500' },
          { title: '503 · Pemeliharaan', url: '/errors/503' },
        ],
      },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { title: 'Brand & design system', url: '/brand', icon: ICONS.brand },
      { title: 'Pengaturan', items: settingsNavItems, icon: ICONS.settings },
      { title: 'Komponen', url: '/prop-components', icon: ICONS.components },
      { title: 'Pusat bantuan', url: '/help-center', icon: ICONS.help },
      { title: 'Repositori sumber', url: 'https://github.com/AAPM-Development/AAPM-shadcn-vue-admin', icon: ICONS.external },
    ],
  },
]

export const otherPages: NavGroup[] = [
  {
    title: 'Lainnya',
    items: [
      { title: 'Paket & harga', icon: ICONS.billing, url: '/billing' },
    ],
  },
]
