import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, CircleCheckIcon, CircleHelpIcon, CircleIcon, CirclePlusIcon, TimerOffIcon } from '@lucide/vue'

import { toneOf } from '@/components/aapm/tone/tones'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: CircleHelpIcon,
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: CircleIcon,
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: TimerOffIcon,
  },
  {
    value: 'done',
    label: 'Done',
    icon: CircleCheckIcon,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CirclePlusIcon,
  },
].map(s => ({ ...s, tone: toneOf('task', s.value) }))

export const priorities = [
  {
    value: 'low',
    label: 'Low',
    icon: ArrowDownIcon,
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: ArrowRightIcon,
  },
  {
    value: 'high',
    label: 'High',
    icon: ArrowUpIcon,
  },
].map(p => ({ ...p, tone: toneOf('priority', p.value) }))
