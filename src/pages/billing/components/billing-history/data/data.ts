import { CircleDashedIcon, CircleSlashIcon, ClockAlertIcon, HandCoinsIcon } from '@lucide/vue'

export const plans = [
  { value: 'basic', label: 'Basic' },
  { value: 'Small Business', label: 'Small Business' },
  { value: 'Enterprise', label: 'Enterprise' },
]

export const statuses = [
  { value: 'paid', label: 'Paid', icon: HandCoinsIcon },
  { value: 'unpaid', label: 'Unpaid', icon: CircleDashedIcon },
  { value: 'overdue', label: 'Overdue', icon: ClockAlertIcon },
  { value: 'cancelled', label: 'Cancelled', icon: CircleSlashIcon },
]

export type PayState = 'paid' | 'unpaid' | 'overdue' | 'cancelled'
