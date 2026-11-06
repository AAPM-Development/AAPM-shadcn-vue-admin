import type { ButtonVariants } from '@/components/ui/button'

/**
 * shadcn Button is `whitespace-nowrap` with a fixed height, so one long label (translated copy, a
 * document name) sets the min-content of every ancestor grid and pushes the page sideways. Text
 * buttons in the work components wrap inside their container instead; the padding keeps each
 * size's single-line height exact and `min-h` holds it as the floor (#41, #98, #101).
 */
const WRAP: Partial<Record<NonNullable<ButtonVariants['size']>, string>> = {
  xs: 'min-h-6 py-1',
  sm: 'min-h-8 py-1.5',
  default: 'min-h-9 py-2',
  lg: 'min-h-10 py-2.5',
}

/** Classes that let a text Button wrap; '' for icon sizes, whose content cannot wrap. */
export function wrapButtonClass(size: ButtonVariants['size'] = 'default'): string {
  const fit = WRAP[size ?? 'default']
  return fit ? `h-auto max-w-full whitespace-normal wrap-anywhere ${fit}` : ''
}
