import { NEventModuleModel } from '@/stores/nevent/nevent.module'
import type { Props } from './nevent.route'

export function neventLoader(props: Props) {
  const module = NEventModuleModel.create({
    options: props,
    context: {
      options: {
        pubkey: props.author,
        relays: props.relays,
      },
    },
  })
  module.subscribe(module.context!.client).subscribe()
  return module
}
