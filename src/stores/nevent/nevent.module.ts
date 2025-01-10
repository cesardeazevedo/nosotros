import type { ClientSubOptions, NostrClient } from '@/nostr/nostr'
import { subscribeIds } from '@/nostr/operators/subscribeIds'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { NostrEvent } from 'nostr-tools'
import { filter, tap } from 'rxjs'
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
  .volatile(() => ({
    event: undefined as NostrEvent | undefined,
  }))
  .actions((self) => ({
    setEvent(event: NostrEvent) {
      self.event = event
    },
  }))
  .actions((self) => ({
    start(client: NostrClient) {
      const { id, relays } = self.options
      const options = { relayHints: { ids: { [id]: relays } } } as ClientSubOptions
      return subscribeIds(client, id, options).pipe(
        filter((event) => event.id === self.options.id),
        tap((event) => self.setEvent(event)),
      )
    },
  }))

export interface NEventModule extends Instance<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotIn extends SnapshotIn<typeof NEventModuleModel> {}
export interface NEventModuleSnapshotOut extends SnapshotOut<typeof NEventModuleModel> {}
