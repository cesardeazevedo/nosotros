import { createNAddressModule } from '@/stores/modules/naddress.module'
import type { Props } from './NAddressRoute'

export function naddressLoader(props: Props) {
  const module = createNAddressModule({ options: props })
  module.subscribe(module.contextWithFallback.context).subscribe()
  return module
}
