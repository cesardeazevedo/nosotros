/* eslint-disable no-empty-pattern */
import { Kind } from '@/constants/kinds'
import { clearCache } from '@/nostr/cache'
import { db } from '@/nostr/db'
import { parseFollowList } from '@/nostr/helpers/parseFollowList'
import { parseUser } from '@/nostr/helpers/parseUser'
import type { NostrContext } from '@/nostr/context'
import { emitMailbox, replay as replayMailbox } from '@/nostr/operators/trackMailbox'
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
import { fakeComment, fakeEvent, fakeNote } from './faker'
import { RelayServer, TestSigner } from './testHelpers'

interface Fixtures {
  createMockRelay: (url: string, db: NostrEvent[]) => RelayServer
  root: RootStore
  clear: () => void
  login: (pubkey: string) => User
  createContext: (
    options?: Partial<Omit<NostrContext, 'settings'> & { settings: Partial<NostrSettings> }>,
  ) => NostrContext
  createUser: (data: Partial<NostrEvent>) => User
  createNote: (data: Partial<NostrEvent>) => Note
  createComment: (data: Partial<NostrEvent>) => Note
  createFollows: (pubkey: string, tags: string[]) => void
  createReaction: (data: Partial<NostrEvent>) => void
  insertRelayList: (data: Partial<NostrEvent>) => Promise<void>
  signer: TestSigner
}

export const test = base.extend<Fixtures>({
  createMockRelay: async ({}, use) => {
    await use((url: string, db: NostrEvent[]) => {
      return new RelayServer(url, db)
    })
  },
  root: async ({}, use) => {
    await use(rootStore)
  },
  clear: async ({}, use) => {
    clearCache()
    pool.reset()
    //replayIds.clear()
    userStore.clear()
    eventStore.clear()
    noteStore.clear()
    followsStore.clear()
    userRelayStore.clear()
    replayMailbox.clear()
    replayUsers.clear()
    replayNIP02.clear()
    replayNIP65.clear()
    await use(() => null)
  },
  login: async ({ root, createUser }, use) => {
    use((pubkey: string) => {
      root.auth.login({ pubkey, context: { pubkey, signer: { name: 'nip07' } } })
      return createUser({ pubkey })
    })
  },
  createContext: async ({}, use) => {
    use((options) => {
      return {
        ...options,
        settings: {
          ...defaultNostrSettings,
          ...options?.settings,
        },
      } as NostrContext
    })
  },
  createUser: async ({}, use) => {
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
  createNote: async ({ createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = fakeNote(data)
      eventStore.add(event)
      noteStore.add(event as NostrEventNote)
      createUser({ pubkey: event.pubkey })
      return new Note(event)
    })
  },
  createComment: async ({ createUser }, use) => {
    use((data: Partial<NostrEvent>) => {
      const event = fakeComment({ kind: Kind.Comment, ...data })
      eventStore.add(event)
      noteStore.add(event)
      createUser({ pubkey: event.pubkey })
      return new Note(event)
    })
  },
  createFollows: async ({}, use) => {
    use((pubkey: string, followings: string[]) => {
      const event = fakeEvent({
        kind: Kind.Follows,
        pubkey,
        tags: followings.map((follow) => ['p', follow]),
      })
      followsStore.add(event, parseFollowList(event))
    })
  },
  createReaction: async ({}, use) => {
    use((data: Partial<NostrEvent>) => {
      reactionStore.add(fakeEvent(data))
    })
  },
  insertRelayList: async ({}, use) => {
    use(async (data: Partial<NostrEvent>) => {
      const event = fakeEvent({ kind: Kind.RelayList, ...data })
      await db.event.insert(event)
      emitMailbox(event)
    })
    db.clearDB()
  },
  signer: async ({}, use) => {
    const signer = new TestSigner()
    await use(signer)
  },
})
