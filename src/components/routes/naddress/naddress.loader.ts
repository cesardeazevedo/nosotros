import { createNAddressModule } from '@/stores/naddress/naddress.module'
import type { Props } from './naddress.route'

export function naddressLoader(props: Props) {
  const module = createNAddressModule({ options: props })
  module.subscribe(module.context!.client).subscribe()
  return module
}
