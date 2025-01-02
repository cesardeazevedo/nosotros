import type { NostrClientOptions } from '@/nostr/nostr'
import { NostrClient } from '@/nostr/nostr'
import { pool } from '@/nostr/pool'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { EMPTY, merge } from 'rxjs'
import { rootStore } from '../root.store'
import { SignersModel } from '../signers/signers'
import { userStore } from '../users/users.store'
import { NostrSettingsModel } from './nostr.settings.store'

export const NostrContextModel = t
  .model('NostrContextModel', {
    signer: t.maybe(SignersModel),
    settings: t.maybe(NostrSettingsModel),
    options: t.frozen<NostrClientOptions>(),
  })
  .views((self) => ({
    get pubkey() {
      return self.options.pubkey
    },
    get user() {
      return userStore.get(this.pubkey)
    },
  }))
  .volatile((self): { client: NostrClient } => {
    return {
      client: new NostrClient(pool, {
        ...self.options,
        signer: self.signer?.signer,
        settings: self.settings || rootStore.nostrSettings,
      }),
    }
  })
  .actions((self) => ({
    initialize(options: { subFollows: boolean }) {
      const { pubkey } = self.options
      const { subFollows } = options
      return merge(
        self.client.initialize(),
        pubkey ? self.client.users.subscribe(pubkey) : EMPTY,
        pubkey && subFollows !== false ? self.client.follows.subscribe(pubkey) : EMPTY,
      )
    },
  }))

export interface NostrContext extends Instance<typeof NostrContextModel> {}
export interface NostrContextSnapshotIn extends SnapshotIn<typeof NostrContextModel> {}
