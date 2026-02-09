import type { NostrFilter } from '@/core/types'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import type { FeedModule, FeedScope } from '@/hooks/query/useQueryFeeds'
import type { NostrContext } from '@/nostr/context'
import type { QueryKey } from '@tanstack/react-query'
import { createStore } from 'jotai'
import {
  createFeedAtoms,
  createMediaFeedAtoms,
  persistentFeedStatesAtom,
  sessionFeedStatesAtom,
} from '../modules.atoms'

function createFeedModule(id: string, extras?: Partial<FeedModule>): FeedModule {
  const base: FeedModule = {
    id,
    type: 'feed',
    filter: {} as NostrFilter,
    queryKey: ['feed', id] as unknown as QueryKey,
    ctx: {} as NostrContext,
    scope: 'home' as FeedScope,
    pageSize: 10,
    autoUpdate: false,
    blured: false,
    includeReplies: undefined,
  }
  return { ...base, ...extras }
}

describe('assert module atoms', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('assert returns options when no session or persistent state', () => {
    const id = 'feed/home'
    const options = createFeedModule(id, { pageSize: 10, autoUpdate: false })

    const store = createStore()
    const feedAtoms = createFeedAtoms(options)

    const value = store.get(feedAtoms.atom)
    expect(value.id).toBe(id)
    expect(value.type).toBe('feed')
    expect(value.pageSize).toBe(10)
    expect(value.autoUpdate).toBe(false)
  })

  test('assert merges options with persistent when session empty', () => {
    const id = 'feed/home'
    const options = createFeedModule(id, { pageSize: 10, autoUpdate: false })

    const store = createStore()

    store.set(persistentFeedStatesAtom, {
      [id]: createFeedModule(id, { pageSize: 25, autoUpdate: true }),
    })

    const feedAtoms = createFeedAtoms(options)

    const value = store.get(feedAtoms.atom)
    expect(value.id).toBe(id)
    expect(value.pageSize).toBe(25)
    expect(value.autoUpdate).toBe(true)
  })

  test('assert session state wins over persistent and options', () => {
    const id = 'feed/home'
    const options = createFeedModule(id, { pageSize: 10, autoUpdate: false })

    const store = createStore()
    store.set(persistentFeedStatesAtom, {
      [id]: createFeedModule(id, { pageSize: 25, autoUpdate: true }),
    })

    store.set(sessionFeedStatesAtom, {
      [id]: createFeedModule(id, { pageSize: 50, autoUpdate: false }),
    })

    const feedAtoms = createFeedAtoms(options)
    const value = store.get(feedAtoms.atom)

    expect(value.pageSize).toBe(50)
    expect(value.autoUpdate).toBe(false)
  })

  test('assert save atom', () => {
    const id = 'feed/home'
    const store = createStore()
    const feedAtoms = createFeedAtoms(createFeedModule(id, { pageSize: 10, autoUpdate: false }))

    let persisted = store.get(persistentFeedStatesAtom)
    let saved = persisted[id] as FeedModule
    expect(saved).toBeUndefined()

    store.set(feedAtoms.atom, { pageSize: 20, autoUpdate: true })
    store.set(feedAtoms.save)

    persisted = store.get(persistentFeedStatesAtom)
    saved = persisted[id] as FeedModule

    expect(saved.pageSize).toBeUndefined()
    expect(saved.autoUpdate).toBe(true)
  })

  test('assert filter atom', () => {
    const store = createStore()
    const initialFilter = { kinds: [1] }
    const feedAtoms = createFeedAtoms(createFeedModule('feed/home', { filter: initialFilter }))

    const filter = store.get(feedAtoms.filter)
    expect(filter).toStrictEqual(initialFilter)

    const nextFilter = { kinds: [1, 6], authors: ['pub1'] }
    store.set(feedAtoms.filter, nextFilter)

    const filter2 = store.get(feedAtoms.filter)
    expect(filter2).toStrictEqual(nextFilter)
    expect(store.get(feedAtoms.atom).filter).toStrictEqual(nextFilter)

    store.set(feedAtoms.filter, (prev) => ({ ...prev, limit: 100 }))

    const filter3 = store.get(feedAtoms.filter)
    expect(filter3).toStrictEqual({ kinds: [1, 6], authors: ['pub1'], limit: 100 })
  })

  test('assert isDirty from filter kinds', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { filter: { kinds: [1, 6] } })

    const feedAtoms = createFeedAtoms(options)
    expect(store.get(feedAtoms.isDirty)).toBe(false)

    store.set(feedAtoms.filter, (prev) => ({ ...prev, kinds: [1] }))

    expect(store.get(feedAtoms.isDirty)).toBe(true)

    store.set(feedAtoms.filter, (prev) => ({ ...prev, kinds: [1, 6] }))
    expect(store.get(feedAtoms.isDirty)).toBe(false)
  })

  test('assert isDirty false from persisted state', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { filter: { kinds: [1, 6] } })

    const feedAtoms = createFeedAtoms(options)

    store.set(persistentFeedStatesAtom, {
      [id]: createFeedModule(id, { filter: { kinds: [1] } }),
    })

    expect(store.get(feedAtoms.isDirty)).toBe(false)
  })

  test('assert isDirty from createMediaFeed', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { filter: { kinds: [20] } })

    const feedAtoms = createMediaFeedAtoms({ ...options, layout: 'row' })
    expect(store.get(feedAtoms.isDirty)).toBe(false)

    store.set(feedAtoms.layout, 'grid')
    expect(store.get(feedAtoms.isDirty)).toBe(true)

    store.set(feedAtoms.layout, 'row')
    expect(store.get(feedAtoms.isDirty)).toBe(false)
  })

  test('assert isDirty from createMediaFeed persisted', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { filter: { kinds: [20] } })

    store.set(persistentFeedStatesAtom, {
      [id]: createFeedModule(id, { filter: { kinds: [20] }, layout: 'grid' } as MediaFeedModule),
    })
    const feedAtoms = createMediaFeedAtoms({ ...options, layout: 'row' })

    expect(store.get(feedAtoms.layout)).toBe('grid')
    expect(store.get(feedAtoms.isDirty)).toBe(false)

    store.set(feedAtoms.layout, 'row')
    expect(store.get(feedAtoms.isDirty)).toBe(true)

    store.set(feedAtoms.layout, 'grid')
    expect(store.get(feedAtoms.isDirty)).toBe(false)
  })

  test('assert isModified from filter kinds', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { filter: { kinds: [1, 6] } })

    const feedAtoms = createFeedAtoms(options)
    expect(store.get(feedAtoms.isModified)).toBe(false)

    store.set(persistentFeedStatesAtom, {
      [id]: createFeedModule(id, { filter: { kinds: [1] } }),
    })
    expect(store.get(feedAtoms.isModified)).toBe(true)
  })

  test('assert isModified from blured', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { blured: false })

    const feedAtoms = createFeedAtoms(options)
    expect(store.get(feedAtoms.isModified)).toBe(false)

    store.set(persistentFeedStatesAtom, {
      [id]: createFeedModule(id, { blured: true }),
    })
    expect(store.get(feedAtoms.isModified)).toBe(true)
  })

  test('assert reset atom', () => {
    const id = 'feed'
    const store = createStore()
    const options = createFeedModule(id, { filter: { kinds: [1, 6] } })
    const feedAtoms = createFeedAtoms(options)

    store.set(feedAtoms.filter, { kinds: [1] })
    expect(store.get(feedAtoms.filter)).toStrictEqual({ kinds: [1] })

    store.set(feedAtoms.save)
    const { pageSize, ...expected } = options
    expect(store.get(persistentFeedStatesAtom)).toStrictEqual({
      [id]: {
        ...expected,
        filter: { kinds: [1] },
      },
    })

    store.set(feedAtoms.reset)
    expect(store.get(feedAtoms.filter)).toStrictEqual({ kinds: [1, 6] })
    expect(store.get(persistentFeedStatesAtom)).toStrictEqual({ [id]: options })
  })

  test('assert sync', () => {
    const id = 'feed/home'
    const store = createStore()
    const initialOptions = createFeedModule(id, {
      filter: { kinds: [1] },
      includeReplies: false,
    })

    const feedAtoms = createFeedAtoms(initialOptions)

    expect(store.get(feedAtoms.filter)).toStrictEqual({ kinds: [1] })
    expect(store.get(feedAtoms.includeReplies)).toBe(false)

    const newOptions = createFeedModule(id, {
      filter: { kinds: [1, 6] },
      includeReplies: true,
    })
    store.set(feedAtoms.sync, newOptions)

    expect(store.get(feedAtoms.filter)).toStrictEqual({ kinds: [1, 6] })
    expect(store.get(feedAtoms.includeReplies)).toBe(true)
  })

  test('assert relay ctx is preserved when persistent ctx is empty', () => {
    const id = 'relay_feed_bug'
    const store = createStore()
    const options = createFeedModule(id, {
      type: 'relayfeed',
      ctx: {
        relays: ['wss://nostr.wine'],
        network: 'REMOTE_ONLY',
      } as NostrContext,
    })

    store.set(persistentFeedStatesAtom, {
      [id]: {
        ...options,
        ctx: {},
      },
    })

    const feedAtoms = createFeedAtoms(options)
    const value = store.get(feedAtoms.atom)

    expect(value.ctx.relays).toStrictEqual(['wss://nostr.wine'])
  })

  test('assert save preserves relay ctx for relayfeed module', () => {
    const id = 'relay_feed_save'
    const store = createStore()
    const options = createFeedModule(id, {
      type: 'relayfeed',
      filter: { kinds: [1], limit: 50 },
      ctx: {
        relays: ['wss://nostr.wine'],
        network: 'REMOTE_ONLY',
        negentropy: false,
      } as NostrContext,
    })
    const feedAtoms = createFeedAtoms(options)

    store.set(feedAtoms.save)
    const persisted = store.get(persistentFeedStatesAtom)[id] as FeedModule

    expect(persisted.ctx.relays).toStrictEqual(['wss://nostr.wine'])
  })
})
