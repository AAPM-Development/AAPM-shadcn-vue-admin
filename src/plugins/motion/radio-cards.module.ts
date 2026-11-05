/**
 * Radio cards: every `[data-aapm-radio-cards]` container (a RadioGroup whose options are cards)
 * gets one `[data-aapm-card-highlight]` that slides to the card holding `[data-state="checked"]`
 * (translate + size, 320ms emphasis — styled in assets/motion/controls.css). Cards are the
 * container's element children; they stay transparent so the highlight is the only selected fill.
 */
import type { MotionModule } from './types'

const CONTAINER = '[data-aapm-radio-cards]'
const HIGHLIGHT = 'data-aapm-card-highlight'
const CHECKED = '[data-state="checked"]'

const groups = new WeakMap<HTMLElement, { highlight: HTMLElement, mo: MutationObserver, ro?: ResizeObserver }>()
let installed = false

function checkedCard(container: HTMLElement, highlight: HTMLElement) {
  for (const child of container.children) {
    if (child === highlight || !(child instanceof HTMLElement))
      continue
    if (child.matches(CHECKED) || child.querySelector(CHECKED))
      return child
  }
  return null
}

function place(container: HTMLElement, highlight: HTMLElement, animate: boolean) {
  const card = checkedCard(container, highlight)
  if (!card) {
    highlight.style.opacity = '0'
    return
  }
  // First appearance lands in place; only later changes glide.
  const glide = animate && highlight.style.opacity === '1'
  if (!glide)
    highlight.style.transition = 'none'
  highlight.style.opacity = '1'
  highlight.style.width = `${card.offsetWidth}px`
  highlight.style.height = `${card.offsetHeight}px`
  highlight.style.translate = `${card.offsetLeft}px ${card.offsetTop}px`
  highlight.style.borderRadius = getComputedStyle(card).borderRadius
  if (!glide)
    requestAnimationFrame(() => (highlight.style.transition = ''))
}

function enhance(container: HTMLElement) {
  if (groups.has(container))
    return
  const highlight = document.createElement('span')
  highlight.setAttribute(HIGHLIGHT, '')
  highlight.setAttribute('aria-hidden', 'true')
  container.prepend(highlight)
  place(container, highlight, false)

  const mo = new MutationObserver(() => place(container, highlight, true))
  mo.observe(container, { attributes: true, attributeFilter: ['data-state'], childList: true, subtree: true })
  let ro: ResizeObserver | undefined
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => place(container, highlight, false))
    ro.observe(container)
  }
  groups.set(container, { highlight, mo, ro })
}

function scan(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(CONTAINER).forEach(enhance)
}

export const setupRadioCards: MotionModule = () => {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined')
    return
  installed = true
  scan(document)
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement))
          return
        if (node.matches(CONTAINER))
          enhance(node)
        scan(node)
      })
    }
  }).observe(document.body, { childList: true, subtree: true })
}

export default setupRadioCards
