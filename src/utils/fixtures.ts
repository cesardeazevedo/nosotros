/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-pattern */
import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5 } from '@/constants/testRelays'
import { clearCache } from '@/nostr/cache'
import { db } from '@/nostr/db'
import { replay as replayMailbox } from '@/nostr/mailbox'
import { parseNote } from '@/nostr/nips/nip01/metadata/parseNote'
import { parseUser } from '@/nostr/nips/nip01/metadata/parseUser'
import { replay as replayUsers } from '@/nostr/nips/nip01/nip01.users'
import { replay as replayNIP02 } from '@/nostr/nips/nip02.follows'
import { replay as replayNIP65, type UserRelayDB } from '@/nostr/nips/nip65.relaylist'
import type { NostrClientOptions } from '@/nostr/nostr'
import { NostrClient } from '@/nostr/nostr'
import { pool } from '@/nostr/pool'
import { defaultNostrSettings, type NostrSettings } from '@/nostr/settings'
import { Follows } from '@/stores/follows/follow'
import { followsStore } from '@/stores/follows/follows.store'
import type { Note } from '@/stores/notes/note'
import { noteStore } from '@/stores/notes/notes.store'
import { reactionStore } from '@/stores/reactions/reactions.store'
import { rootStore, type RootStore } from '@/stores/root.store'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { type NostrEvent } from 'nostr-tools'
import { test as base } from 'vitest'
import WS from 'vitest-websocket-mock'
import { fakeNote } from './faker'
import { RelayServer, TestSigner } from './testHelpers'

interface Fixtures {
  createMockRelay: (url: string, db: NostrEvent[]) => RelayServer
  relay: WS
  relay2: WS
  relay3: WS
  relay4: WS
  relay5: WS
  root: RootStore
  clear: () => void
  login: (pubkey: string) => User
  createClient: (
    options?: Partial<Omit<NostrClientOptions, 'settings'> & { settings: Partial<NostrSettings> }>,
  ) => NostrClient
  createUser: (data: Partial<NostrEvent>) => User
  createNote: (data: Partial<NostrEvent>, client?: NostrClient) => Note
  createFollows: (pubkey: string, tags: string[]) => void
  createUserRelay: (pubkey: string, data: UserRelayDB[]) => void
  createReaction: (data: Partial<NostrEvent>) => void
  insertRelayList: (data: Partial<NostrEvent>, client?: NostrClient) => Promise<void>
  signer: TestSigner
}

export const test = base.extend<Fixtures>({
  createMockRelay: async ({}, use) => {
    await use((url: string, db: NostrEvent[]) => {
      return new RelayServer(url, db)
    })
  },
  relay: async ({}, use) => {
    const relay = new WS(RELAY_1, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  relay2: async ({}, use) => {
    const relay = new WS(RELAY_2, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  relay3: async ({}, use) => {
    const relay = new WS(RELAY_3, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  relay4: async ({}, use) => {
    const relay = new WS(RELAY_4, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  relay5: async ({}, use) => {
    const relay = new WS(RELAY_5, { jsonProtocol: true })
    await use(relay)
    relay.close()
  },
  root: async ({}, use) => {
    await use(rootStore)
  },
  clear: async ({ root }, use) => {
    clearCache()
    pool.reset()
    userStore.clear()
    noteStore.clear()
    followsStore.clear()
    userRelayStore.clear()
    replayMailbox.clear()
    replayUsers.clear()
    replayNIP02.clear()
    replayNIP65.clear()
    await use(() => {})
  },
  login: async ({ root, createUser }, use) => {
    use((pubkey: string) => {
      root.auth.login({ pubkey, context: { options: { pubkey }, signer: { name: 'nip07' } } })
      return createUser({ pubkey })
    })
  },
  createClient: async ({ clear }, use) => {
    use((options) => {
      return new NostrClient(pool, {
        ...options,
        settings: {
          ...defaultNostrSettings,
          ...options?.settings,
        },
      })
    })
  },
  createUser: async ({ root, clear }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = fakeNote({
        id: '1',
        kind: Kind.Metadata,
        content: '{"name": "user"}',
        created_at: 1,
        ...data,
      })
      userStore.add(new User(event, parseUser(event)))

      return userStore.users.get(event.pubkey) as User
    })
  },
  createNote: async ({ clear, createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = fakeNote(data)
      const metadata = parseNote(event)
      createUser({ pubkey: event.pubkey })
      return noteStore.add(event, metadata)
    })
  },
  createFollows: async ({ clear }, use) => {
    use((pubkey: string, followings: string[]) => {
      const follows = new Follows(
        fakeNote({
          kind: Kind.Follows,
          pubkey,
          tags: followings.map((follow) => ['p', follow]),
        }),
      )
      followsStore.add(follows)
    })
  },
  createUserRelay: async ({ clear }, use) => {
    use((pubkey: string, data: UserRelayDB[]) => {
      userRelayStore.add(pubkey, data)
    })
  },
  createReaction: async ({ clear }, use) => {
    use((data: Partial<NostrEvent>) => {
      reactionStore.add(fakeNote(data))
    })
  },
  insertRelayList: async ({ clear }, use) => {
    use(async (data: Partial<NostrEvent>, client?: NostrClient) => {
      const event = fakeNote({ kind: Kind.RelayList, ...data })
      await db.event.insert(event)
      if (client) {
        client.mailbox.emit(event)
      }
    })
    db.clearDB()
  },
  signer: async ({}, use) => {
    const signer = new TestSigner()
    await use(signer)
  },
})
