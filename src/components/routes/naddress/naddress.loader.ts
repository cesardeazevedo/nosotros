import { NAddressModuleModel } from '@/stores/naddress/naddress.module'
import type { Props } from './naddress.route'

export function naddressLoader(props: Props) {
  const module = NAddressModuleModel.create({
    options: props,
    context: {
      options: {
        pubkey: props.pubkey,
        relays: props.relays,
      },
    },
  })
  module.subscribe(module.context!.client).subscribe()
  return module
}
