import type { EventTemplate } from 'nostr-tools'
import { filter, from, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { isAuthorTag } from '../helpers/parseTags'
import { subscribeMailbox, toArrayRelay } from '../subscriptions/subscribeMailbox'
import { READ } from '../types'

export function getInboxRelaysFromTags(baseCtx: NostrContext, event: EventTemplate) {
  const ctx = {
    ...baseCtx,
    permission: READ,
    maxRelaysPerUser: 10,
  }
  return from(event.tags).pipe(
    filter(isAuthorTag),
    mergeMap(([, pubkey]) => subscribeMailbox(pubkey, ctx)),
    toArrayRelay,
  )
}
