// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sound } from '@/lib/sound'

import UiSound from '../ui-sound.vue'

describe('ui sound toggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ui-sound toggles the stored preference', async () => {
    const play = vi.spyOn(sound, 'play').mockReturnValue(true)
    const wrapper = mount(UiSound)
    expect(wrapper.text()).toContain('Suara antarmuka')

    const toggle = wrapper.get('[role="switch"]')
    expect(toggle.attributes('aria-checked')).toBe('true')

    await toggle.trigger('click')
    expect(localStorage.getItem('aapm-ui-sound')).toBe('off')
    expect(toggle.attributes('aria-checked')).toBe('false')
    expect(play).not.toHaveBeenCalled()

    await toggle.trigger('click')
    expect(localStorage.getItem('aapm-ui-sound')).toBe('on')
    expect(play).toHaveBeenCalledWith('success')
  })
})
