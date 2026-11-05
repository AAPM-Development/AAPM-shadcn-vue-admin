// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import AapmIcon from '../../AapmIcon.vue'
import { ICONS } from '../../registry'
import { ACTION_NAMES, ANIMATED_ACTIONS } from '../actions'
import AnimatedIcon from '../animated-icon.vue'

const ICONS_CSS = readFileSync(join(process.cwd(), 'src/assets/motion/icons.css'), 'utf8')

function endAnimation(el: Element, animationName: string) {
  el.dispatchEvent(new AnimationEvent('animationend', { animationName, bubbles: true }))
}

afterEach(() => {
  vi.useRealTimers()
})

describe('animated action icons', () => {
  it('every action maps to a registry icon', () => {
    expect(ACTION_NAMES).toHaveLength(16)
    for (const name of ACTION_NAMES)
      expect(ICONS[ANIMATED_ACTIONS[name].icon], name).toBeTruthy()
  })

  it('every action has keyframes in icons.css', () => {
    for (const name of ACTION_NAMES) {
      const { keyframes } = ANIMATED_ACTIONS[name]
      expect(keyframes, name).toBe(`aapm-icon-${name}`)
      expect(ICONS_CSS, name).toMatch(new RegExp(`@keyframes ${keyframes}\\s*\\{`))
    }
  })

  it('plays when play turns true', async () => {
    const wrapper = mount(AnimatedIcon, { props: { name: 'like' } })
    expect(wrapper.attributes('data-action')).toBe('like')
    expect(wrapper.attributes('data-playing')).toBe('false')

    await wrapper.setProps({ play: true })
    expect(wrapper.attributes('data-playing')).toBe('true')

    // Another animation finishing (e.g. a nested part) does not end the action.
    endAnimation(wrapper.find('svg').element, 'aapm-unrelated')
    await nextTick()
    expect(wrapper.attributes('data-playing')).toBe('true')

    endAnimation(wrapper.find('svg').element, 'aapm-icon-like')
    await nextTick()
    expect(wrapper.attributes('data-playing')).toBe('false')
  })

  it('copy swaps to a check', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AnimatedIcon, { props: { name: 'copy' } })
    expect(wrapper.find('svg').classes()).toContain('lucide-copy')

    await wrapper.setProps({ play: true })
    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.find('svg').classes()).toContain('lucide-check')

    vi.advanceTimersByTime(1200)
    await nextTick()
    expect(wrapper.find('svg').classes()).toContain('lucide-copy')
  })

  it('labelled icons expose a name', () => {
    // Through AapmIcon: `animate` swaps in the animated variant; its root is the Lucide svg.
    const labelled = mount(AapmIcon, { props: { name: 'copy', animate: true, label: 'Salin' } })
    const root = labelled.find('svg')
    expect(root.attributes('data-action')).toBe('copy')
    expect(root.attributes('role')).toBe('img')
    expect(root.attributes('aria-label')).toBe('Salin')
    expect(root.attributes('aria-hidden')).toBeUndefined()

    const decorative = mount(AapmIcon, { props: { name: 'copy', animate: true } })
    expect(decorative.find('svg').attributes('aria-hidden')).toBe('true')
    expect(decorative.find('svg').attributes('role')).toBeUndefined()
  })
})
