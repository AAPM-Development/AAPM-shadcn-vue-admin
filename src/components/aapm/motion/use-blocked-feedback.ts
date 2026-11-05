import type { Ref } from 'vue'

import { nextTick } from 'vue'

import { focusFirstInvalid, shake } from './motion-blur'

interface SubmittableForm {
  handleSubmit: () => unknown
  state: { isValid: boolean }
}

/**
 * Feedback for a blocked submit (validation failed): shake the surrounding dialog — or the
 * form itself outside a dialog — with horizontal motion blur, then focus the first invalid
 * control (UX-07). Fires on every blocked attempt; TanStack's own `onSubmitInvalid` only
 * fires on the first one. Pass the form (or scroll wrapper) template ref and use
 * `@submit.prevent="submit"` with `const submit = submitWith(form)`.
 */
export function useBlockedFeedback(root: Readonly<Ref<HTMLElement | null>>) {
  async function onBlocked() {
    await nextTick()
    const surface = root.value?.closest<HTMLElement>('[role="dialog"], [role="alertdialog"]') ?? root.value
    focusFirstInvalid(root.value)
    await shake(surface)
  }

  function submitWith(form: SubmittableForm) {
    return async () => {
      await form.handleSubmit()
      if (!form.state.isValid)
        await onBlocked()
    }
  }

  return { onBlocked, submitWith }
}
