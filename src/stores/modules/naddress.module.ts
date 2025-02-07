import type { ClientSubOptions, NostrClient } from '@/nostr/nostr'
import { replayIds } from '@/nostr/subscriptions/subscribeIds'
import { subscribeIdsFromQuotes } from '@/nostr/subscriptions/subscribeIdsFromQuotes'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { BaseModuleModel } from '../modules/module'

export type NAddressOptions = {
  identifier: string
  kind: number
  pubkey: string
  relays?: string[]
}

export const NAddressModuleModel = BaseModuleModel.named('NAddressModuleModel')
  .props({
    type: t.optional(t.literal('naddress'), 'naddress'),
    options: t.frozen<NAddressOptions>(),
  })
  .views((self) => ({
    get address() {
      const { identifier, kind, pubkey } = self.options
      return `${kind}:${pubkey}:${identifier}`
    },

    subscribe(client: NostrClient) {
      const options = {} as ClientSubOptions
      replayIds.invalidate(this.address)
      return subscribeIdsFromQuotes(this.address, client, options)
    },
  }))

export function createNAddressModule(snapshot: Pick<NAddressModuleSnapshotIn, 'id' | 'options'>) {
  return NAddressModuleModel.create({
    ...snapshot,
    context: {
      options: {
        pubkey: snapshot.options.pubkey,
        relays: snapshot.options.relays,
      },
    },
  })
}

export interface NAddressModule extends Instance<typeof NAddressModuleModel> {}
export interface NAddressModuleSnapshotIn extends SnapshotIn<typeof NAddressModuleModel> {}
export interface NAddressModuleSnapshotOut extends SnapshotOut<typeof NAddressModuleModel> {}
