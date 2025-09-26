import { settingsAtom } from '@/atoms/settings.atoms'
import { store } from '@/atoms/store'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { delay, identity, mergeMap, filter as rxFilter } from 'rxjs'
import type { FeedScope } from '../query/useQueryFeeds'
import { subscribeFeed } from './subscribeFeed'

export function subscribeLive(ctx: NostrContext, scope: FeedScope, filter: NostrFilter) {
  const now = Date.now() / 10000
  return subscribeFeed(
    {
      ...ctx,
      closeOnEose: false,
      negentropy: false,
      subId: 'live',
      // REMOTE_ONLY doesn't get inserted in the database
      network: ctx.network === 'REMOTE_ONLY' ? 'REMOTE_ONLY' : 'LIVE',
      maxRelaysPerUser: store.get(settingsAtom).maxRelaysPerUser,
    },
    scope,
    {
      ...filter,
      since: parseInt((Date.now() / 1000).toString()),
    },
  ).pipe(
    delay(1000),
    mergeMap(identity),
    rxFilter((event) => event.created_at > now && event.created_at < (Date.now() + 2000) / 1000),
  )
}
