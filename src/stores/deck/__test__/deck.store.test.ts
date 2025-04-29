import { FeedStoreModel } from '@/stores/feeds/feed.store'
import { initialState } from '@/stores/helpers/initialState'
import { HomeModuleModel } from '@/stores/modules/home.module'
import { RootStoreViewsModel } from '@/stores/root.store'
import type { DeckStore } from '../deck.store'

describe('DeckStoreModel', () => {
  let store: DeckStore

  beforeEach(() => {
    store = RootStoreViewsModel.create(initialState).decks
  })

  test('add deck', () => {
    const newDeck = store.add({ name: 'books', icon: '📘', columns: [] })
    expect(store.decks.size).toBe(2)
    expect(store.selected.id).toBe('root')
    store.select(newDeck.id)
    expect(store.selected.id).toBe(newDeck.id)
  })

  test('add home to deck', () => {
    const deck = store.decks.get('root')!
    const module = HomeModuleModel.create({ id: 'home' })
    FeedStoreModel.create({
      scope: 'self',
      context: { pubkey: '1', permission: 2 },
      filter: { kinds: [1], authors: ['1'] },
      range: 120,
      options: {
        includeRoot: true,
        includeParents: false,
        includeReplies: false,
      },
    })
    deck.add(module)
    expect(deck.columns).toEqual(['home'])
    expect(deck.list).toContain(module)
  })

  test('add column to deck on index 0', () => {
    const deck = store.decks.get('root')!
    deck.add(HomeModuleModel.create({ id: 'home1' }))
    deck.add(HomeModuleModel.create({ id: 'home2' }), 0, false)
    expect(deck.columns).toEqual(['home2', 'home1'])
  })

  test('replace column', () => {
    const deck = store.decks.get('root')!
    deck.add(HomeModuleModel.create({ id: 'home1' }))
    deck.add(HomeModuleModel.create({ id: 'home2' }), 0, true)
    expect(deck.columns).toEqual(['home2'])
  })

  test('replace first column', () => {
    const deck = store.decks.get('root')!
    deck.add(HomeModuleModel.create({ id: 'home1' }))
    deck.add(HomeModuleModel.create({ id: 'home2' }))
    expect(deck.columns).toEqual(['home1', 'home2'])
    deck.add(HomeModuleModel.create({ id: 'home1_updated' }), 0, true)
    expect(deck.columns).toEqual(['home1_updated', 'home2'])
  })

  test('move columns', () => {
    const deck = store.decks.get('root')!
    deck.add(HomeModuleModel.create({ id: 'home1' }))
    deck.add(HomeModuleModel.create({ id: 'home2' }))
    deck.add(HomeModuleModel.create({ id: 'home3' }))
    expect(deck.columns).toEqual(['home1', 'home2', 'home3'])
  })

  test('delete column from deck', () => {
    const deck = store.decks.get('root')!
    deck.add(HomeModuleModel.create({ id: 'home' }))
    deck.delete('home')
    expect(deck.columns).toEqual([])
    expect(deck.list).toEqual([])
  })

  test('reset columns', () => {
    const deck = store.decks.get('root')!
    deck.add(HomeModuleModel.create({ id: 'home' }))
    deck.reset()
    expect(deck.columns.length).toBe(0)
  })
})
