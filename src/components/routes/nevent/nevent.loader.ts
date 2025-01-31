import { createNEventModule } from '@/stores/nevent/nevent.module'
import type { Props } from './nevent.route'

export function neventLoader(options: Props) {
  const module = createNEventModule({ options })
  module.subscribe(module.context!.client).subscribe()
  return module
}
