/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-pattern */
import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5 } from '@/constants/testRelays'
import { clearCache } from '@/nostr/cache'
import { db } from '@/nostr/db'
import { parseFollowList } from '@/nostr/helpers/parseFollowList'
import { parseUser } from '@/nostr/helpers/parseUser'
import { replay as replayMailbox } from '@/nostr/mailbox'
import type { NostrClientOptions } from '@/nostr/nostr'
import { NostrClient } from '@/nostr/nostr'
import { replayIds } from '@/nostr/operators/subscribeIds'
import { pool } from '@/nostr/pool'
import { defaultNostrSettings, type NostrSettings } from '@/nostr/settings'
import { replay as replayNIP02 } from '@/nostr/subscriptions/subscribeFollows'
import { replay as replayNIP65 } from '@/nostr/subscriptions/subscribeRelayList'
import { replay as replayUsers } from '@/nostr/subscriptions/subscribeUser'
import { type NostrEventNote } from '@/nostr/types'
import { eventStore } from '@/stores/events/event.store'
import { followsStore } from '@/stores/follows/follows.store'
import { Note } from '@/stores/notes/note'
import { noteStore } from '@/stores/notes/notes.store'
import { reactionStore } from '@/stores/reactions/reactions.store'
import { rootStore, type RootStore } from '@/stores/root.store'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { type NostrEvent } from 'nostr-tools'
import { test as base } from 'vitest'
import WS from 'vitest-websocket-mock'
import { fakeComment, fakeEvent, fakeNote } from './faker'
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
  createComment: (data: Partial<NostrEvent>, client?: NostrClient) => Note
  createFollows: (pubkey: string, tags: string[]) => void
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
    replayIds.clear()
    userStore.clear()
    eventStore.clear()
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
      const event = fakeEvent({
        id: '1',
        kind: Kind.Metadata,
        content: '{"name": "user"}',
        created_at: 1,
        ...data,
      })
      userStore.add(event, parseUser(event))

      return userStore.users.get(event.pubkey) as User
    })
  },
  createNote: async ({ clear, createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = fakeNote(data)
      eventStore.add(event)
      noteStore.add(event as NostrEventNote)
      createUser({ pubkey: event.pubkey })
      return new Note(event)
    })
  },
  createComment: async ({ clear, createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = fakeComment({ kind: Kind.Comment, ...data })
      eventStore.add(event)
      noteStore.add(event)
      createUser({ pubkey: event.pubkey })
      return new Note(event)
      // return commentStore.add(event, metadata)
    })
  },
  createFollows: async ({ clear }, use) => {
    use((pubkey: string, followings: string[]) => {
      const event = fakeEvent({
        kind: Kind.Follows,
        pubkey,
        tags: followings.map((follow) => ['p', follow]),
      })
      followsStore.add(event, parseFollowList(event))
    })
  },
  createReaction: async ({ clear }, use) => {
    use((data: Partial<NostrEvent>) => {
      reactionStore.add(fakeEvent(data))
    })
  },
  insertRelayList: async ({ clear }, use) => {
    use(async (data: Partial<NostrEvent>, client?: NostrClient) => {
      const event = fakeEvent({ kind: Kind.RelayList, ...data })
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
