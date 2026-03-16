import { Kind } from '@/constants/kinds'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { fakeEventMeta } from 'utils/faker'
import { initializeSQLite } from '../../sqlite.schemas'
import { SqliteEventSearch } from '../sqlite.events.fts'
import { SqliteEventStore } from '../sqlite.events'

let db: Database
let store: SqliteEventStore
let search: SqliteEventSearch

describe('SqliteEventStore.querySearch', () => {
  beforeAll(async () => {
    db = (await initializeSQLite('test-search.sqlite3', false)).db
    db.exec('PRAGMA foreign_keys = ON;')
    store = new SqliteEventStore(Promise.resolve(db))
    search = new SqliteEventSearch(Promise.resolve(db))
  })

  beforeEach(() => {
    db.exec('DELETE FROM tags;')
    db.exec('DELETE FROM events;')
    db.exec('DELETE FROM events_fts;')
  })

  test('assert text search content from body, topics and client tags', () => {
    const text = fakeEventMeta({
      id: 'text-1',
      kind: Kind.Text,
      pubkey: 'pubkey1',
      created_at: 100,
      content: 'hello https://example.com nostr:note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
      tags: [
        ['t', 'nostr'],
        ['client', 'damus'],
      ],
    })
    const article = fakeEventMeta({
      id: 'article-1',
      kind: Kind.Article,
      pubkey: 'pubkey2',
      created_at: 200,
      content: 'long form writing about gardening',
      tags: [
        ['d', 'article-1'],
        ['t', 'garden'],
      ],
    })
    const relayList = fakeEventMeta({
      id: 'relay-1',
      kind: Kind.RelayList,
      pubkey: 'pubkey3',
      created_at: 300,
      content: 'relay list should not be indexed',
    })

    store.insertEvent(db, text)
    store.insertEvent(db, article)
    store.insertEvent(db, relayList)
    search.indexEvent(db, text)
    search.indexEvent(db, article)
    search.indexEvent(db, relayList)

    const topicResults = store.query(db, { search: 'nostr', limit: 10 })
    expect(topicResults.map((event) => event.id)).toStrictEqual(['text-1'])

    const clientResults = store.query(db, { search: 'damus', limit: 10 })
    expect(clientResults.map((event) => event.id)).toStrictEqual(['text-1'])

    const articleResults = store.query(db, { search: 'gardening', limit: 10 })
    expect(articleResults.map((event) => event.id)).toStrictEqual(['article-1'])

    const linkResults = store.query(db, { search: 'example.com', limit: 10 })
    expect(linkResults).toStrictEqual([])

    const nonSearchable = store.query(db, { search: 'relay', limit: 10 })
    expect(nonSearchable).toStrictEqual([])
  })

  test('assert results ordered by created_at desc and respects kind filter', () => {
    const olderText = fakeEventMeta({
      id: 'text-old',
      kind: Kind.Text,
      pubkey: 'pubkey1',
      created_at: 100,
      content: 'garden update',
    })
    const newerArticle = fakeEventMeta({
      id: 'article-new',
      kind: Kind.Article,
      pubkey: 'pubkey2',
      created_at: 200,
      content: 'garden update',
      tags: [['d', 'article-new']],
    })

    store.insertEvent(db, olderText)
    store.insertEvent(db, newerArticle)
    search.indexEvent(db, olderText)
    search.indexEvent(db, newerArticle)

    const results = store.query(db, { search: 'garden', limit: 10 })
    expect(results.map((event) => event.id)).toStrictEqual(['article-new', 'text-old'])

    const textOnly = store.query(db, { search: 'garden', kinds: [Kind.Text], limit: 10 })
    expect(textOnly.map((event) => event.id)).toStrictEqual(['text-old'])
  })
})
