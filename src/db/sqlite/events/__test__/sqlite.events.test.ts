import { Kind } from '@/constants/kinds'
import type { Database } from '@sqlite.org/sqlite-wasm'
import type { NostrEvent } from 'nostr-tools'
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
    db = await initializeSQLite('test.sqlite3', false)
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
})
