import type { ClientSubOptions, NostrClient } from '@/nostr/nostr'
import { replayIds } from '@/nostr/operators/subscribeIds'
import { subscribeIdsFromQuotes } from '@/nostr/operators/subscribeIdsFromQuotes'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import type { Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { mergeMap } from 'rxjs'
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
      return subscribeIdsFromQuotes(this.address, client, options).pipe(
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

export interface NAddressModule extends Instance<typeof NAddressModuleModel> {}
export interface NAddressModuleSnapshotIn extends SnapshotIn<typeof NAddressModuleModel> {}
export interface NAddressModuleSnapshotOut extends SnapshotOut<typeof NAddressModuleModel> {}
