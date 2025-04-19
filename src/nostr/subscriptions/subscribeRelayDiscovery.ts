import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { tap } from 'rxjs'
import type { NostrContext } from '../context'
import { enqueueRelayInfo } from '../nip11'
import { subscribe } from './subscribe'
import { withRelatedAuthors } from './withRelatedAuthor'

const kinds = [Kind.RelayDiscovery]

export function subscribeRelayDiscorvery(filter: NostrFilter, ctx: NostrContext) {
  return subscribe({ limit: 500, ...filter, kinds }, ctx).pipe(
    withRelatedAuthors(ctx),
    tap((event) => {
      // fetch relays without infos
      if (event.content === '' || event.content === '{}') {
        enqueueRelayInfo(event.tags.find((x) => x[0] === 'd')?.[1])
      }
    }),
  )
}
