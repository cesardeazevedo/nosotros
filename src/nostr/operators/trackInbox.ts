import type { NostrEvent } from 'nostr-tools'
import { mergeMap, of } from 'rxjs'
import { isAuthorTag } from '../helpers/parseTags'
import type { NostrContext } from '../context'
import { READ } from '../types'
import { toArrayRelay, trackMailbox } from './trackMailbox'

export function trackInbox(ctx: NostrContext, event: NostrEvent) {
  const config = {
    permission: READ,
    ignore: ctx.inboxSets,
    maxRelaysPerUser: ctx.settings.maxRelaysPerUserInbox,
  }
  return of(event).pipe(
    mergeMap((event) => event.tags.filter((tag) => isAuthorTag(tag)).flatMap((tag) => tag[1])),
    mergeMap((pubkey) => trackMailbox(pubkey, config, ctx).pipe(toArrayRelay)),
  )
}
