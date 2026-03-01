import { Kind } from '@/constants/kinds'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { type NostrEvent } from 'nostr-tools'
import { fakeEventMeta } from 'utils/faker'
import { initializeSQLite } from '../../sqlite.schemas'
import { SqliteEventStore } from '../sqlite.events'

let db: Database
let store: SqliteEventStore

function selectEvents(): NostrEvent[] {
  return db.selectObjects(`SELECT * FROM events`) as unknown as NostrEvent[]
}

function selectTags() {
  return db.selectObjects(`SELECT * FROM tags`) as unknown as {
    eventId: string
    tag: string
    value: string
  }[]
}

describe('SqliteEventStore.insertEvent', () => {
  beforeAll(async () => {
    db = (await initializeSQLite('test.sqlite3', false)).db
    db.exec('PRAGMA foreign_keys = ON;')
    store = new SqliteEventStore(Promise.resolve(db))
  })

  beforeEach(() => {
    db.exec('DELETE FROM tags;')
    db.exec('DELETE FROM events;')
  })

  test('inserts plain event + tags', () => {
    const e = fakeEventMeta({
      id: 'id1',
      kind: Kind.Text,
      pubkey: 'pubkey1',
      tags: [
        ['p', 'pubkey2'],
        ['e', 'event1'],
      ],
    })
    store.insertEvent(db, e)

    const events = selectEvents()
    const tags = selectTags()

    expect(events.length).toBe(1)
    expect(events[0].id).toBe('id1')
    expect(tags.length).toBe(2)
    expect(tags.every((t) => t.eventId === 'id1')).toBe(true)
  })

  test('replaceable (kind 3): newer replaces older; older ignored', () => {
    const older = fakeEventMeta({ id: 'id1', kind: Kind.Follows, pubkey: 'pubkey2', created_at: 100 })
    const newer = fakeEventMeta({ id: 'id2', kind: Kind.Follows, pubkey: 'pubkey2', created_at: 200 })
    const oldest = fakeEventMeta({ id: 'id3', kind: Kind.Follows, pubkey: 'pubkey2', created_at: 50 })

    store.insertEvent(db, older)
    expect(selectEvents().map((e) => e.id)).toStrictEqual(['id1'])

    store.insertEvent(db, newer)
    expect(selectEvents().map((e) => e.id)).toStrictEqual(['id2'])

    store.insertEvent(db, oldest)
    expect(selectEvents().map((e) => e.id)).toStrictEqual(['id2'])
  })

  test('parameterized (30023): newer replaces older and old tags removed', () => {
    const first = fakeEventMeta({
      id: 'id1',
      kind: 30023,
      pubkey: 'pubkey3',
      created_at: 10,
      tags: [
        ['d', 'post-1'],
        ['p', 'pubkey1'],
      ],
    })
    const second = fakeEventMeta({
      id: 'id2',
      kind: 30023,
      pubkey: 'pubkey3',
      created_at: 20,
      tags: [
        ['d', 'post-1'],
        ['p', 'pubkey2'],
      ],
    })

    store.insertEvent(db, first)
    expect(selectEvents().map((e) => e.id)).toStrictEqual(['id1'])
    expect(selectTags().map((t) => t.value)).toContain('pubkey1')

    store.insertEvent(db, second)
    expect(selectEvents().map((e) => e.id)).toStrictEqual(['id2'])

    const tags = selectTags()
    expect(tags.every((t) => t.eventId === 'id2')).toBe(true)
    expect(tags.map((t) => t.value)).toContain('pubkey2')
    expect(tags.map((t) => t.value)).not.toContain('pubkey1')
  })

  test('duplicate tags ignored', () => {
    const e = fakeEventMeta({
      id: 'id1',
      kind: Kind.Text,
      tags: [
        ['e', 'event1'],
        ['e', 'event1'],
        ['p', 'pubkey1'],
      ],
    })
    store.insertEvent(db, e)

    const tags = selectTags()
    expect(tags.length).toBe(2)
  })

  test('assert expired event', () => {
    const expired = fakeEventMeta({
      id: 'expired1',
      kind: Kind.Text,
      created_at: 100,
      tags: [['expiration', '50']],
    })

    store.insertEvent(db, expired)

    const events = selectEvents()
    const tags = selectTags()

    expect(events).toHaveLength(0)
    expect(tags).toHaveLength(0)
  })

  test('assert nip-09 deletes only referenced events from same pubkey and keeps delete event', () => {
    const mine = fakeEventMeta({
      id: 'note_mine_1',
      kind: Kind.Text,
      pubkey: 'author_a',
      created_at: 100,
      tags: [],
    })
    const other = fakeEventMeta({
      id: 'note_other_1',
      kind: Kind.Text,
      pubkey: 'author_b',
      created_at: 101,
      tags: [],
    })
    const deletion = fakeEventMeta({
      id: 'delete_1',
      kind: 5,
      pubkey: 'author_a',
      created_at: 102,
      tags: [
        ['e', 'note_mine_1'],
        ['e', 'note_other_1'],
        ['k', String(Kind.Text)],
      ],
      content: 'cleanup',
    })

    store.insertEvent(db, mine)
    store.insertEvent(db, other)
    store.insertEvent(db, deletion)

    const ids = selectEvents().map((e) => e.id)

    expect(ids).toContain('delete_1')
    expect(ids).toContain('note_other_1')
    expect(ids).not.toContain('note_mine_1')
  })

  test('assert nip-09 a-tag deletes addressable versions and blocks older rebroadcast', () => {
    const v1 = fakeEventMeta({
      id: 'article_v1',
      kind: Kind.Article,
      pubkey: 'author_a',
      created_at: 100,
      tags: [['d', 'slug-1']],
    })
    const v2 = fakeEventMeta({
      id: 'article_v2',
      kind: Kind.Article,
      pubkey: 'author_a',
      created_at: 120,
      tags: [['d', 'slug-1']],
    })
    const deletion = fakeEventMeta({
      id: 'delete_article',
      kind: Kind.EventDeletion,
      pubkey: 'author_a',
      created_at: 130,
      tags: [
        ['a', `${Kind.Article}:author_a:slug-1`],
        ['k', String(Kind.Article)],
      ],
    })
    const rebroadcastOld = fakeEventMeta({
      id: 'article_old_rebroadcast',
      kind: Kind.Article,
      pubkey: 'author_a',
      created_at: 110,
      tags: [['d', 'slug-1']],
    })

    store.insertEvent(db, v1)
    store.insertEvent(db, v2)
    store.insertEvent(db, deletion)

    let ids = selectEvents().map((e) => e.id)
    expect(ids).toContain('delete_article')
    expect(ids).not.toContain('article_v1')
    expect(ids).not.toContain('article_v2')

    store.insertEvent(db, rebroadcastOld)
    ids = selectEvents().map((e) => e.id)
    expect(ids).not.toContain('article_old_rebroadcast')
  })
})

describe('SqliteEventStore.query', () => {
  beforeAll(async () => {
    db = (await initializeSQLite('test.sqlite3', false)).db
    store = new SqliteEventStore(Promise.resolve(db))
  })

  beforeEach(() => {
    db.exec('DELETE FROM tags;')
    db.exec('DELETE FROM events;')
  })

  test('assert authors filter', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)

    const results = store.query(db, { authors: ['p1'] })

    expect(results.map((e: NostrEvent) => e.id)).toStrictEqual(['3', '1'])
  })

  test('assert tags', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100, tags: [] })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 200, tags: [['e', '1']] })
    const e3 = fakeEventMeta({
      id: '3',
      kind: Kind.Text,
      pubkey: 'p1',
      created_at: 300,
      tags: [
        ['e', '1'],
        ['e', '2'],
      ],
    })
    const e4 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 400, tags: [['e', '1']] })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    // also assert there is not duplicated events
    const res = store.query(db, { kinds: [Kind.Text], until: 300, '#e': ['1', '2'] })

    expect(res.map((e: NostrEvent) => e.id)).toStrictEqual(['3', '2'])
  })

  test('assert tags limit', () => {
    const e1 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 100, tags: [['e', '1']] })
    const e2 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p2', created_at: 200, tags: [['e', '1']] })
    const e3 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p2', created_at: 300, tags: [['e', '1']] })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)

    const res = store.query(db, { kinds: [Kind.Text], limit: 2, '#e': ['1'] })
    expect(res.map((e: NostrEvent) => e.id)).toStrictEqual(['4', '3'])
  })

  test('filters by ids', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })
    const e4 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 400 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    const results = store.query(db, { ids: ['2', '4'] })

    expect(results.map((e) => e.id)).toStrictEqual(['2', '4'])
  })

  test('assert empty ids filter returns no events', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 200 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)

    const results = store.query(db, { ids: [] })

    expect(results).toStrictEqual([])
  })

  test('assert empty authors filter returns no events', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 200 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)

    const results = store.query(db, { authors: [] })

    expect(results).toStrictEqual([])
  })
})

describe('SqliteEventStore.queryNeg', () => {
  beforeAll(async () => {
    db = (await initializeSQLite('test.sqlite3', false)).db
    store = new SqliteEventStore(Promise.resolve(db))
  })

  beforeEach(() => {
    db.exec('DELETE FROM tags;')
    db.exec('DELETE FROM events;')
  })

  test('returns only id and created_at', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100, content: 'test content' })
    store.insertEvent(db, e1)

    const results = store.queryNeg(db, { authors: ['p1'] })

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ id: '1', created_at: 100 })
    expect(results[0]).not.toHaveProperty('content')
    expect(results[0]).not.toHaveProperty('pubkey')
  })

  test('filters by authors', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)

    const results = store.queryNeg(db, { authors: ['p1'] })

    expect(results.map((e) => e.id)).toStrictEqual(['3', '1'])
  })

  test('filters by kinds', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Follows, pubkey: 'p1', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)

    const results = store.queryNeg(db, { kinds: [Kind.Text], authors: ['p1'] })

    expect(results.map((e) => e.id)).toStrictEqual(['3', '1'])
  })

  test('filters by tags', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100, tags: [] })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 200, tags: [['e', '1']] })
    const e3 = fakeEventMeta({
      id: '3',
      kind: Kind.Text,
      pubkey: 'p1',
      created_at: 300,
      tags: [
        ['e', '1'],
        ['e', '2'],
      ],
    })
    const e4 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 400, tags: [['e', '1']] })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    const results = store.queryNeg(db, { kinds: [Kind.Text], until: 300, '#e': ['1', '2'] })

    expect(results.map((e) => e.id)).toStrictEqual(['3', '2'])
  })

  test('respects limit', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })
    const e4 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 400 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    const results = store.queryNeg(db, { kinds: [Kind.Text], authors: ['p1'], limit: 2 })

    expect(results.map((e) => e.id)).toStrictEqual(['4', '3'])
  })

  test('sorts by created_at DESC, id ASC for deterministic order', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e3 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 100 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)

    const results = store.queryNeg(db, { kinds: [Kind.Text], authors: ['p1'] })

    expect(results.map((e) => e.id)).toStrictEqual(['1', '2', '3'])
  })

  test('limit with same timestamps uses id ASC as tiebreaker', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e4 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 100 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    const results = store.queryNeg(db, { kinds: [Kind.Text], authors: ['p1'], limit: 2 })

    expect(results.map((e) => e.id)).toStrictEqual(['1', '2'])
  })

  test('filters by since and until', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })
    const e4 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 400 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    const results = store.queryNeg(db, { kinds: [Kind.Text], since: 150, until: 350 })

    expect(results.map((e) => e.id)).toStrictEqual(['3', '2'])
  })

  test('tag filter with limit', () => {
    const e1 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p2', created_at: 100, tags: [['e', '1']] })
    const e2 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p2', created_at: 200, tags: [['e', '1']] })
    const e3 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p2', created_at: 300, tags: [['e', '1']] })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)

    const results = store.queryNeg(db, { kinds: [Kind.Text], limit: 2, '#e': ['1'] })

    expect(results.map((e) => e.id)).toStrictEqual(['4', '3'])
  })

  test('filters by ids', () => {
    const e1 = fakeEventMeta({ id: '1', kind: Kind.Text, pubkey: 'p1', created_at: 100 })
    const e2 = fakeEventMeta({ id: '2', kind: Kind.Text, pubkey: 'p1', created_at: 200 })
    const e3 = fakeEventMeta({ id: '3', kind: Kind.Text, pubkey: 'p1', created_at: 300 })
    const e4 = fakeEventMeta({ id: '4', kind: Kind.Text, pubkey: 'p1', created_at: 400 })

    store.insertEvent(db, e1)
    store.insertEvent(db, e2)
    store.insertEvent(db, e3)
    store.insertEvent(db, e4)

    const results = store.queryNeg(db, { ids: ['2', '4'] })

    expect(results.map((e) => e.id)).toStrictEqual(['4', '2'])
  })
})
