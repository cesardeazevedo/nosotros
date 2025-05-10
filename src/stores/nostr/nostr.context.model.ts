import type { NostrContext } from '@/nostr/context'
import { cast, t } from 'mobx-state-tree'
import { withSetAction } from '../helpers/withSetAction'
import { withToggleAction } from '../helpers/withToggleAction'

export const NostrContextModel = t
  .model('NostrContextModel', {
    relays: t.optional(t.array(t.string), []),
    relaySets: t.optional(t.array(t.string), []),
    relaysLocal: t.optional(t.array(t.string), []),
    pubkey: t.maybe(t.string),
    permission: t.maybe(t.number),
    batcher: t.maybe(t.frozen<NostrContext['batcher']>()),
    nip05: t.optional(t.boolean, true),
    outbox: t.optional(t.boolean, true),
    authAuto: t.maybe(t.boolean),
    authWhitelist: t.optional(t.array(t.string), []),
    ignoreRelays: t.optional(t.array(t.string), []),
    queryDB: t.optional(t.boolean, true),
    insertDB: t.optional(t.boolean, true),
    maxRelaysPerUser: t.optional(t.number, 2),
  })
  .actions(withSetAction)
  .actions(withToggleAction)
  .actions((self) => ({
    addRelay(relay: string) {
      self.relays.push(relay)
    },
    removeRelay(relay: string) {
      self.relays = cast(self.relays.filter((x) => x !== relay))
    },
    toggleAuthRelay(url: string) {
      if (self.authWhitelist.includes(url)) {
        self.authWhitelist = cast(self.authWhitelist.filter((x) => x !== url))
      } else {
        self.authWhitelist.push(url)
      }
    },
  }))
