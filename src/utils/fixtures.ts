/* eslint-disable no-empty-pattern */
import { Kind } from '@/constants/kinds'
import type { RelayStatsDB } from '@/db/types'
import { clearCache } from '@/nostr/cache'
import { db } from '@/nostr/db'
import { parseComment } from '@/nostr/helpers/parseComment'
import { parseNote } from '@/nostr/helpers/parseNote'
import { parseUser } from '@/nostr/helpers/parseUser'
import { pool } from '@/nostr/pool'
import { replay as replayNIP02 } from '@/nostr/subscriptions/subscribeFollows'
import { replayIds } from '@/nostr/subscriptions/subscribeIds'
import { replay as replayMailbox } from '@/nostr/subscriptions/subscribeMailbox'
import { replay as replayNIP65 } from '@/nostr/subscriptions/subscribeRelayList'
import { replay as replayUsers } from '@/nostr/subscriptions/subscribeUser'
import { eventStore } from '@/stores/events/event.store'
import { Note } from '@/stores/notes/note'
import { rootStore, type RootStore } from '@/stores/root.store'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { type NostrEvent } from 'nostr-tools'
import { test as base } from 'vitest'
import { fakeEvent, fakeEventMeta } from './faker'
import { RelayServer, TestSigner } from './testHelpers'

interface Fixtures {
  createMockRelay: (url: string, db: NostrEvent[]) => RelayServer
  root: RootStore
  reset: () => void
  login: (pubkey: string) => User
  createUser: (data: Partial<NostrEvent>) => User
  createNote: (data: Partial<NostrEvent>) => Note
  createComment: (data: Partial<NostrEvent>) => Note
  createFollows: (pubkey: string, tags: string[]) => void
  insertRelayStats: (url: string, data: Partial<RelayStatsDB>) => Promise<void>
  insertRelayList: (data: Partial<NostrEvent>) => Promise<void>
  signer: TestSigner
}

export const test = base.extend<Fixtures>({
  reset: [
    async ({}, use) => {
      clearCache()
      pool.reset()
      userStore.clear()
      eventStore.clear()
      replayIds.clear()
      replayMailbox.clear()
      replayUsers.clear()
      replayNIP02.clear()
      replayNIP65.clear()
      await db.clearDB()
      await use(() => null)
    },
    { auto: true },
  ],
  createMockRelay: async ({}, use) => {
    await use((url: string, db: NostrEvent[]) => {
      return new RelayServer(url, db)
    })
  },
  root: async ({}, use) => {
    await use(rootStore)
  },
  login: async ({ root, createUser }, use) => {
    use((pubkey: string) => {
      root.auth.login({ pubkey, signer: { name: 'nip07' } })
      return createUser({ pubkey })
    })
  },
  createUser: async ({}, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = userStore.add(
        fakeEventMeta(
          {
            id: '1',
            kind: Kind.Metadata,
            content: '{"name": "user"}',
            created_at: 1,
            ...data,
          },
          parseUser,
        ),
      )

      return userStore.users.get(event.pubkey) as User
    })
  },
  createNote: async ({ createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = eventStore.add(fakeEventMeta(data, parseNote))
      createUser({ pubkey: event.pubkey })
      return new Note(event)
    })
  },
  createComment: async ({ createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = eventStore.add(fakeEventMeta({ kind: Kind.Comment, ...data }, parseComment))
      createUser({ pubkey: event.pubkey })
      return new Note(event)
    })
  },
  createFollows: async ({}, use) => {
    use((pubkey: string, followings: string[]) => {
      eventStore.add(
        fakeEvent({
          kind: Kind.Follows,
          pubkey,
          tags: followings.map((follow) => ['p', follow]),
        }),
      )
    })
  },
  insertRelayList: async ({}, use) => {
    use(async (data: Partial<NostrEvent>) => {
      const event = fakeEvent({ kind: Kind.RelayList, ...data })
      await db.event.insert(event)
    })
  },
  insertRelayStats: async ({}, use) => {
    use(async (url: string, data: Partial<RelayStatsDB>) => {
      await db.relayStats.insert({
        connects: 0,
        closes: 0,
        events: 0,
        eoses: 0,
        notices: [],
        auths: 0,
        errors: 0,
        errorMessages: [],
        subscriptions: 0,
        publishes: 0,
        lastAuth: 0,
        lastConnected: 0,
        ...data,
        url,
      } as RelayStatsDB)
    })
  },
  signer: async ({}, use) => {
    const signer = new TestSigner()
    await use(signer)
  },
})
