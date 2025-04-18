import type { NostrContext } from '@/nostr/context'
import { subscribeIds } from '@/nostr/subscriptions/subscribeIds'
import { replay, subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import { mergeMap, mergeWith, tap } from 'rxjs'
import { createContextAuthenticator } from '../auth/authenticator'
import type { NostrModule } from '../modules/nostr.module'
import { rootStore } from '../root.store'

export function subscribeNostrModule(module: NostrModule) {
  const ctx = { ...rootStore.globalContext, ...module.context, outbox: true } as NostrContext
  return subscribeIds(module.filter, ctx).pipe(
    tap((x) => replay.invalidate(x.id)),
    mergeMap((event) => subscribeNoteStats(event, ctx, {})),
    mergeWith(createContextAuthenticator(ctx)),
  )
}
