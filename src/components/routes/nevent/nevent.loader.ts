import { createNEventModule } from '@/stores/modules/nevent.module'
import type { Props } from './nevent.route'

export function neventLoader(options: Props) {
  const module = createNEventModule({ options })
  module.subscribe(module.contextWithFallback.context).subscribe()
  return module
}
