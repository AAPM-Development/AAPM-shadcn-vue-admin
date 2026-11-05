import type { App } from 'vue'

import { setupAutoAnimate } from './auto-animate/setup'
import { setupDayjs } from './dayjs/setup'
import { setupI18n } from './i18n/setup'
import { setupMotion } from './motion/setup'
import { setupNProgress } from './nprogress/setup'
import { setupPinia } from './pinia/setup'
import { setupRouter } from './router/setup'
import { setupSmoothScroll } from './smooth-scroll/setup'
import { setupSound } from './sound/setup'
import { setupTanstackVueQuery } from './tanstack-vue-query/setup'

export function setupPlugins(app: App) {
  setupDayjs()
  setupNProgress()
  setupAutoAnimate(app)
  setupMotion()
  setupSmoothScroll()
  setupSound()
  setupTanstackVueQuery(app)
  setupI18n(app)
  setupPinia(app)
  setupRouter(app)
}
