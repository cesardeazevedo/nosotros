import type { NostrContext } from '@/nostr/context'
import { replayIds, subscribeIds } from '@/nostr/subscriptions/subscribeIds'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { mergeMap } from 'rxjs'
import { BaseModuleModel } from '../modules/module'

export type NEventOptions = {
  id: string
  kind?: number
  author?: string
  relays?: string[]
}

export const NEventModuleModel = BaseModuleModel.named('NEventModuleModel')
  .props({
    type: t.optional(t.literal('nevent'), 'nevent'),
    options: t.frozen<NEventOptions>(),
  })
  .views((self) => ({
    subscribe(ctx: NostrContext) {
      const { id, relays } = self.options
      const subOptions = { relayHints: { ids: { [id]: relays } } } as NostrContext['subOptions']
      replayIds.invalidate(id)
      return subscribeIds(id, { ...ctx, subOptions }).pipe(
        mergeMap((event) => {
          return subscribeNoteStats(event, ctx, {})
        }),
      )
    },
  }))

export function createNEventModule(snapshot: Pick<NEventModuleSnapshotIn, 'id' | 'options'>) {
  return NEventModuleModel.create({
    ...snapshot,
    context: {
      pubkey: snapshot.options.author,
      // relays: snapshot.options.relays,
    },
  })
}

export interface NEventModule extends Instance<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotIn extends SnapshotIn<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotOut extends SnapshotOut<typeof NEventModuleModel> {}
