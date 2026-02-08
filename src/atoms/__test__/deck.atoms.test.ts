import type { Modules } from '@/hooks/modules/module'
import { createStore } from 'jotai'
import { vi } from 'vitest'
import type { DeckState } from '../deck.atoms'
import {
  addDeckColumnAtom,
  createDeckAtom,
  decksAtom,
  DEFAULT_DECK,
  deleteDeckAtom,
  removeDeckColumnAtom,
  selectDeckAtom,
} from '../deck.atoms'
import { persistentFeedStatesAtom } from '../modules.atoms'

describe('assert decks atoms', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  test('assert initializes with default deck', () => {
    const store = createStore()
    const value = store.get(decksAtom)

    expect(value).toBeTruthy()
    expect(Object.keys(value)).toContain('default')
    expect(value.default).toStrictEqual(DEFAULT_DECK)
  })

  test('assert creates a new deck with derived id and empty columns', () => {
    const store = createStore()
    const payload: Omit<DeckState, 'id' | 'columnIds'> = { name: 'deck', icon: '💼' }

    store.set(createDeckAtom, payload)

    const all = store.get(decksAtom)
    const expectedId = payload.name.replace(' ', '')
    expect(Object.keys(all)).toStrictEqual(['default', expectedId])
    expect(all[expectedId]).toBeTruthy()
    expect(all[expectedId].id).toBe(expectedId)
    expect(all[expectedId].icon).toBe('💼')
    expect(all[expectedId].columnIds).toStrictEqual([])
  })

  test('assert create is a no-op when deck id already exists', () => {
    const store = createStore()
    const payload: Omit<DeckState, 'id' | 'columnIds'> = { name: 'deck', icon: '💼' }

    store.set(createDeckAtom, payload)
    const before = store.get(decksAtom)

    store.set(createDeckAtom, payload)
    const after = store.get(decksAtom)

    expect(after).toStrictEqual(before)
  })

  test('assert select returns deck when it exists', () => {
    const store = createStore()
    const payload: Omit<DeckState, 'id' | 'columnIds'> = { name: 'deck', icon: 'A' }

    store.set(createDeckAtom, payload)
    const deckId = payload.name.replace(' ', '')

    const selected = store.get(selectDeckAtom(deckId))
    expect(selected?.id).toBe(deckId)
  })

  test('assert select returns null when deck is missing', () => {
    const store = createStore()
    const selected = store.get(selectDeckAtom('missing'))
    expect(selected).toBeNull()
  })

  test('assert add column pushes a new id when no index is provided', () => {
    const store = createStore()
    const payload: Omit<DeckState, 'id' | 'columnIds'> = { name: 'deck', icon: '🧱' }
    store.set(createDeckAtom, payload)
    const deckId = payload.name.replace(' ', '')

    vi.spyOn(Math, 'random').mockReturnValue(0.123456)
    const modA = { id: 'feed:home' } as unknown as Modules

    store.set(addDeckColumnAtom, { deckId, module: modA })

    const decks = store.get(decksAtom)
    expect(decks[deckId].columnIds).toStrictEqual(['feed:home_123456'])
  })

  test('assert add column inserts or replaces at index', () => {
    const store = createStore()
    const payload: Omit<DeckState, 'id' | 'columnIds'> = { name: 'deck', icon: '🧊' }
    store.set(createDeckAtom, payload)
    const deckId = payload.name.replace(' ', '')

    vi.spyOn(Math, 'random').mockReturnValue(0.222222)
    const modA = { id: 'feed:a' } as unknown as Modules
    const modB = { id: 'feed:b' } as unknown as Modules
    const modC = { id: 'feed:c' } as unknown as Modules

    store.set(addDeckColumnAtom, { deckId, module: modA })
    vi.spyOn(Math, 'random').mockReturnValue(0.333333)
    store.set(addDeckColumnAtom, { deckId, module: modB })

    vi.spyOn(Math, 'random').mockReturnValue(0.444444)
    store.set(addDeckColumnAtom, { deckId, module: modC, index: 1 })

    let decks = store.get(decksAtom)
    expect(decks[deckId].columnIds).toStrictEqual(['feed:a_222222', 'feed:c_444444', 'feed:b_333333'])

    vi.spyOn(Math, 'random').mockReturnValue(0.555555)
    store.set(addDeckColumnAtom, { deckId, module: modB, index: 1, replace: true })

    decks = store.get(decksAtom)
    expect(decks[deckId].columnIds).toStrictEqual(['feed:a_222222', 'feed:b_555555', 'feed:b_333333'])
  })

  test('assert remove column removes a column by id', () => {
    const store = createStore()
    const payload: Omit<DeckState, 'id' | 'columnIds'> = { name: 'deck', icon: '🪵' }
    store.set(createDeckAtom, payload)
    const deckId = payload.name.replace(' ', '')

    const seeded = {
      ...store.get(decksAtom),
      [deckId]: {
        ...store.get(decksAtom)[deckId],
        columnIds: ['x1', 'x2', 'x3'],
      },
    }
    store.set(decksAtom, seeded)

    store.set(removeDeckColumnAtom, { deckId, id: 'x2' })

    const decks = store.get(decksAtom)
    expect(decks[deckId].columnIds).toStrictEqual(['x1', 'x3'])
  })

  test('assert delete deck removes deck and its modules', () => {
    const store = createStore()
    const deckId = 'deck'
    const modules = {
      keep: { id: 'keep' } as unknown as Modules,
      col1: { id: 'col1' } as unknown as Modules,
      col2: { id: 'col2' } as unknown as Modules,
    }

    store.set(decksAtom, {
      ...store.get(decksAtom),
      [deckId]: {
        id: deckId,
        name: 'deck',
        icon: 'A',
        columnIds: ['col1', 'col2'],
      },
    })
    store.set(persistentFeedStatesAtom, modules)

    store.set(deleteDeckAtom, deckId)

    const decks = store.get(decksAtom)
    expect(decks[deckId]).toBeUndefined()

    const nextModules = store.get(persistentFeedStatesAtom)
    expect(nextModules.keep).toBeTruthy()
    expect(nextModules.col1).toBeUndefined()
    expect(nextModules.col2).toBeUndefined()
  })
})
