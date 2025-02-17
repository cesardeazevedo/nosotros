import type { NProfileFeeds, NProfileModule } from '@/stores/nprofile/nprofile.module'
import { createNprofileModule } from '@/stores/nprofile/nprofile.module'
import type { AnyRoute, AnyRouteMatch } from '@tanstack/react-router'
import type { Props } from './NProfileRoute'

export function nprofileLoader(options: Props) {
  const id = 'nprofile_' + options.pubkey
  return createNprofileModule({ id, options })
}

export async function nprofileFeedLoader(
  options: {
    route: AnyRoute
    abortController: AbortController
    parentMatchPromise: Promise<AnyRouteMatch>
  },
  selected: keyof NProfileFeeds,
) {
  const parent = await options.parentMatchPromise
  const module = parent.loaderData as NProfileModule
  module.select(selected)
  module.subscribe(module.contextWithFallback.context).subscribe()
  return module
}
