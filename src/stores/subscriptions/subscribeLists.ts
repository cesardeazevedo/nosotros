import { Kind } from '@/constants/kinds'
import { isAuthorTag } from '@/nostr/helpers/parseTags'
import { subscribe } from '@/nostr/subscriptions/subscribe'
import { subscribeFollows } from '@/nostr/subscriptions/subscribeFollows'
import { bufferTime, EMPTY, filter, mergeMap, tap } from 'rxjs'
import { addNostrEventToStore } from '../helpers/addNostrEventToStore'
import { toStream } from '../helpers/toStream'
import { rootStore } from '../root.store'

export function subscribeLists() {
  return toStream(() => rootStore.auth.selected).pipe(
    mergeMap((user) => (user ? subscribeFollows(user.pubkey, rootStore.globalContext) : EMPTY)),
    mergeMap((event) => {
      return subscribe(
        { kinds: [Kind.RelaySets, Kind.FollowSets], authors: event.tags.filter(isAuthorTag).map((x) => x[1]) },
        { outbox: true, queryDB: false, insertStore: false },
      )
    }),
    bufferTime(2000),
    filter((x) => x.length > 0),
    tap((events) => {
      events.forEach((event) => {
        addNostrEventToStore(event)
      })
    }),
  )
}
