import type { NotesFeedSubscription } from '@/stores/feeds/feed.notes'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'
import { NProfileModuleModel } from '@/stores/nprofile/nprofile.module'
import type { AnyRoute, AnyRouteMatch } from '@tanstack/react-router'
import type { Props } from './nprofile.route'

export function nprofileLoader(props: Props) {
  const id = 'nprofile_' + props.pubkey
  const module = NProfileModuleModel.create({
    id,
    options: {
      pubkey: props.pubkey,
      relays: props.relays,
    },
    context: {
      options: {
        pubkey: props.pubkey,
      },
    },
  })

  return module
}

export async function nprofileFeedLoader(options: {
  route: AnyRoute
  abortController: AbortController
  parentMatchPromise: Promise<AnyRouteMatch>
}) {
  const parent = await options.parentMatchPromise
  const module = parent.loaderData as NProfileModule
  const key = (options.route.path === '/' ? 'notes' : options.route.path) as keyof NProfileModule['feeds']
  const feed = module.feeds[key] as NotesFeedSubscription
  feed.subscribe(module.context!.client).subscribe()
  return module
}
