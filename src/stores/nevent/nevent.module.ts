import type { ClientSubOptions, NostrClient } from '@/nostr/nostr'
import { replayIds, subscribeIds } from '@/nostr/operators/subscribeIds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { filter } from 'rxjs'
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
      return subscribeIds(id, client, options).pipe(filter((event) => event.id === self.options.id))
    },
  }))

export interface NEventModule extends Instance<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotIn extends SnapshotIn<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotOut extends SnapshotOut<typeof NEventModuleModel> {}
