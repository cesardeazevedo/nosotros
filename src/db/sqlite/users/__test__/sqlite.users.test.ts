import type { Database } from '@sqlite.org/sqlite-wasm'
import { initializeSQLite } from '../../sqlite.schemas'
import { SqliteUsers } from '../sqlite.users'

let db: Database
let store: SqliteUsers

async function delay() {
  await new Promise((resolve) => setTimeout(resolve, 600))
}

describe('SqliteUsers', () => {
  beforeAll(async () => {
    db = (await initializeSQLite('test-users.sqlite3', false)).db
    store = new SqliteUsers(Promise.resolve(db))
  })

  beforeEach(() => {
    db.exec('DELETE FROM users;')
  })

  test('assert upsert batches and query returns prefix matches (case-insensitive, trimmed)', async () => {
    store.upsert({ pubkey: 'pubkey1', name: 'Alice' })
    store.upsert({ pubkey: 'pubkey2', name: 'Al' })
    store.upsert({ pubkey: 'pubkey3', name: 'Bob' })

    await delay()

    const results = store.query(db, { prefix: '  aL  ', limit: 10 })
    expect(results.map((r) => r.name)).toStrictEqual(['Al', 'Alice'])
    expect(results.map((r) => r.pubkey)).toStrictEqual(['pubkey2', 'pubkey1'])
  })

  test('assert upsert updates existing pubkey', async () => {
    store.upsert({ pubkey: 'pubkey1', name: 'Alice' })
    await delay()

    store.upsert({ pubkey: 'pubkey1', name: 'Alicia' })
    await delay()

    const users = db.selectObjects(`SELECT * FROM users`) as unknown as { pubkey: string; name: string }[]
    expect(users).toHaveLength(1)
    expect(users[0].name).toBe('Alicia')
  })

  test('assert prefix escaping treats % and _ as literals', async () => {
    store.upsert({ pubkey: 'pubkey1', name: 'A_1' })
    store.upsert({ pubkey: 'pubkey2', name: 'A%2' })
    await delay()

    const results = store.query(db, { prefix: 'A_', limit: 10 })
    expect(results.map((r) => r.name)).toStrictEqual(['A_1'])
  })
})
