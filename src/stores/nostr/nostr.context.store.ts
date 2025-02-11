import { DEFAULT_RELAYS } from '@/constants/relays'
import type { NostrContext } from '@/nostr/context'
import { toArrayRelay, trackMailbox } from '@/nostr/operators/trackMailbox'
import { subscribeContextRelays } from '@/nostr/subscriptions/subscribeContextRelays'
import { subscribeFollows } from '@/nostr/subscriptions/subscribeFollows'
import { subscribeMutes } from '@/nostr/subscriptions/subscribeMutes'
import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import { READ, WRITE } from '@/nostr/types'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { cast, t } from 'mobx-state-tree'
import { defaultIfEmpty, EMPTY, merge, of } from 'rxjs'
import { addNostrEventToStore } from '../helpers/addNostrEventToStore'
import { publishStore } from '../publish/publish.store'
import { rootStore } from '../root.store'
import { SignersModel } from '../signers/signers'
import { userStore } from '../users/users.store'
import { NostrSettingsModel } from './nostr.settings.store'

const fallbackRelays = defaultIfEmpty<string[], string[]>(DEFAULT_RELAYS)

export const NostrStoreModel = t
  .model('NostrContextModel', {
    relays: t.maybe(t.array(t.string)),
    pubkey: t.maybe(t.string),
    signer: t.maybe(SignersModel),
    settings: t.maybe(NostrSettingsModel),
  })
  .volatile(() => ({
    localSets: new Set<string>(),
    inboxSets: new Set<string>(),
    outboxSets: new Set<string>(),
  }))
  .views((self) => ({
    get user() {
      return userStore.get(self.pubkey)
    },
    get _ctx(): NostrContext {
      return {
        relays: self.relays,
        pubkey: self.pubkey,
        inboxSets: self.inboxSets,
        outboxSets: self.outboxSets,
        localSets: self.localSets,
        signer: self.signer?.signer,
        settings: self.settings || rootStore.nostrSettings,
        inbox$: of([]),
        outbox$: of([]),
        onEvent: (event) => addNostrEventToStore(event),
        onPublish: (response) => publishStore.add(response),
      }
    },
    get outbox$() {
      const config = { permission: WRITE }
      return self.pubkey
        ? trackMailbox(self.pubkey, config, this._ctx).pipe(toArrayRelay, fallbackRelays)
        : of(self.relays || [])
    },
    get inbox$() {
      const config = { permission: READ }
      return self.pubkey
        ? trackMailbox(self.pubkey, config, this._ctx).pipe(toArrayRelay, fallbackRelays)
        : of(self.relays || [])
    },
  }))
  .views((self) => ({
    get context(): NostrContext {
      return {
        ...self._ctx,
        inbox$: self.inbox$,
        outbox$: self.outbox$,
      }
    },
  }))
  .actions((self) => ({
    initialize(options: { subFollows: boolean }) {
      const { pubkey } = self
      const { subFollows } = options
      return merge(
        subscribeContextRelays(self.context),
        pubkey ? subscribeUser(pubkey, self.context) : EMPTY,
        pubkey ? subscribeMutes(pubkey, self.context) : EMPTY,
        pubkey && subFollows !== false ? subscribeFollows(pubkey, self.context) : EMPTY,
      )
    },
    addRelay(relay: string) {
      if (self.relays) {
        self.relays.push(relay)
      }
    },
    removeRelay(relay: string) {
      if (self.relays) {
        self.relays = cast(self.relays.filter((x) => x !== relay))
      }
    },
  }))

export interface NostrStore extends Instance<typeof NostrStoreModel> {}
export interface NostrStoreSnapshotIn extends SnapshotIn<typeof NostrStoreModel> {}
