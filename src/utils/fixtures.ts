import { FIXED_RELAYS } from 'constants/relays'
import { WS } from 'jest-websocket-mock'
import { Event, Filter as NostrFilter } from 'nostr-tools'
import { Filter, Options as FilterOptions } from 'stores/core/filter'
import { Subscription, SubscriptionOptions } from 'stores/core/subscription'
import { database } from 'stores/db/database.store'
import { ObservableDB, dbBatcher } from 'stores/db/observabledb.store'
import { FeedOptions, FeedStore } from 'stores/modules/feed.store'
import { Note } from 'stores/modules/note.store'
import { SchemaNIP65 } from 'stores/nostr/userRelay.store'
import { RootStore } from 'stores/root.store'
import { fakeNote } from 'utils/faker'
import { test as base } from 'vitest'

interface Fixtures {
  relays: WS[]
  root: RootStore
  createFeed: (options?: FeedOptions) => FeedStore
  createNote: (note: Partial<Event>) => Note
  createFilter: (filter: NostrFilter, options?: FilterOptions) => Filter
  createSubscription: (filters: NostrFilter, options?: SubscriptionOptions | undefined) => Subscription
  createRelayList: (note: Partial<Event>) => Promise<SchemaNIP65 | undefined>
  observabledb: ObservableDB<Record<string, unknown>>
}

const defaultRelays = ['wss://relay1.com', 'wss://relay2.com', 'wss://relay3.com']

export const RELAY_1 = defaultRelays[0]
export const RELAY_2 = defaultRelays[1]
export const RELAY_3 = defaultRelays[2]

export const test = base.extend<Fixtures>({
  relays: [],

  root: async ({ relays }, use) => {
    defaultRelays.forEach((url) => relays.push(new WS(url, { jsonProtocol: true })))
    // We are only setting the first relay as the fixed relay
    FIXED_RELAYS.pop()
    const root = new RootStore()
    await root.initialize([defaultRelays[0]])
    await use(root)
    // Clean up
    relays.length = 0
    dbBatcher.subscription.unsubscribe()
    WS.clean()
    await database.clear()
  },

  createFeed: async ({ root }, use) => {
    await use((options?: FeedOptions) => new FeedStore(root, { authors: ['1'], pagination: false, ...options }))
  },

  createNote: async ({ root }, use) => {
    await use((event: Partial<Event>) => {
      const note = new Note(root, fakeNote(event))
      note.imeta.parse()
      note.content.parse()
      return note
    })
  },

  createFilter: async ({ root }, use) => {
    await use((filter: NostrFilter, options?: FilterOptions) => new Filter(root, filter, options))
  },

  createSubscription: async ({ root }, use) => {
    await use((filters, options) => new Subscription(root, new Filter(root, filters), options))
  },

  createRelayList: async ({ root }, use) => {
    await use(async (note) => await root.userRelays.add(fakeNote(note)))
    root.userRelays.relays.clear()
  },

  /* eslint-disable no-empty-pattern */
  observabledb: async ({}, use) => {
    const db = new ObservableDB<Record<string, unknown>>('test')
    await database.initialize()
    await use(db)
    db._data.clear()
    await database.clear()
  },
})
