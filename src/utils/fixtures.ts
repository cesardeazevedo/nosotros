/* eslint-disable no-empty-pattern */
import { FIXED_RELAYS } from 'constants/relays'
import { WS } from 'jest-websocket-mock'
import { Event, Filter as NostrFilter } from 'nostr-tools'
import { Filter, Options as FilterOptions } from 'stores/core/filter'
import { Subscription, SubscriptionOptions } from 'stores/core/subscription'
import { database } from 'stores/db/database.store'
import { ObservableDB } from 'stores/db/observabledb.store'
import { FeedStore } from 'stores/modules/feed.store'
import { PostStore } from 'stores/modules/post.store'
import { RelayStore } from 'stores/nostr/userRelay.store'
import { RootStore } from 'stores/root.store'
import { fakeNote } from 'utils/faker'
import { TestContext, test as base } from 'vitest'

export interface Fixtures {
  relays: WS[]
  root: RootStore
  createFeed: () => FeedStore
  createPost: (note: Partial<Event>) => PostStore
  createFilter: (filter: NostrFilter, options?: FilterOptions) => Filter
  createSubscription: (filters: NostrFilter, options?: SubscriptionOptions | undefined) => Subscription
  createRelayList: (note: Partial<Event>) => Promise<RelayStore | undefined>
  observabledb: ObservableDB<Record<string, unknown>>
}

export const defaultRelays = ['wss://relay1.com', 'wss://relay2.com', 'wss://relay3.com']

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
    WS.clean()
    await database.clear()
  },

  createFeed: async ({ root }: TestContext, use) => {
    await use(() => new FeedStore(root, { authors: ['1'], pagination: false }))
  },

  createPost: async ({ root }: TestContext, use) => {
    await use((note) => new PostStore(root, fakeNote(note)))
  },

  createFilter: async ({ root }: TestContext, use: (fixture: Fixtures['createFilter']) => Promise<void>) => {
    await use((filter, options) => new Filter(root, filter, options))
  },

  createSubscription: async (
    { root }: TestContext,
    // TS losing type information here for some reason
    use: (fixture: Fixtures['createSubscription']) => Promise<void>,
  ) => {
    await use((filters, options): Subscription => {
      return new Subscription(root, new Filter(root, filters), options)
    })
  },

  createRelayList: async ({ root }: TestContext, use) => {
    await use(async (note) => {
      return await root.userRelays.add(fakeNote(note))
    })
    root.userRelays.relays.clear()
  },

  observabledb: async ({}, use) => {
    const db = new ObservableDB<Record<string, unknown>>('test')
    await database.initialize()
    await use(db)
    db._data.clear()
  },
})
