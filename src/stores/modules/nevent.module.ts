import type { ClientSubOptions, NostrClient } from '@/nostr/nostr'
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
    subscribe(client: NostrClient) {
      const { id, relays } = self.options
      const options = { relayHints: { ids: { [id]: relays } } } as ClientSubOptions
      replayIds.invalidate(id)
      return subscribeIds(id, client, options).pipe(
        mergeMap((event) => {
          return subscribeNoteStats(client, event, {
            zaps: true,
            reposts: true,
            replies: true,
            reactions: true,
          })
        }),
      )
    },
  }))

export function createNEventModule(snapshot: Pick<NEventModuleSnapshotIn, 'id' | 'options'>) {
  return NEventModuleModel.create({
    ...snapshot,
    context: {
      options: {
        pubkey: snapshot.options.author,
        relays: snapshot.options.relays,
      },
    },
  })
}

export interface NEventModule extends Instance<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotIn extends SnapshotIn<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotOut extends SnapshotOut<typeof NEventModuleModel> {}
