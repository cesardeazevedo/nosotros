import type { UserDB } from '@/db/types'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'

type UserQuery = {
  prefix: string
  limit?: number
}

export class SqliteUsers {
  batcher: InsertBatcher<UserDB>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (data) => {
      this.insertBatch(await this.db, data)
    })
  }

  query(db: Database, params: UserQuery) {
    const prefix = params.prefix.trim()
    if (!prefix) return []
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
    const sql = `
      SELECT pubkey, name, display_name
      FROM (
        SELECT pubkey, name, display_name
        FROM users
        WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
        UNION
        SELECT pubkey, name, display_name
        FROM users
        WHERE display_name LIKE ? ESCAPE '\\' COLLATE NOCASE
      )
      ORDER BY COALESCE(NULLIF(display_name, ''), name) COLLATE NOCASE ASC
      LIMIT ?
    `
    const like = `${escapeLike(prefix)}%`
    return db.selectObjects(sql, [like, like, limit]) as unknown as UserDB[]
  }

  upsert(user: UserDB) {
    const name = typeof user.name === 'string' ? user.name.trim() : ''
    if (!name || !user.pubkey) {
      return
    }
    this.batcher.next({ ...user, name })
  }

  private insertBatch(db: Database, users: UserDB[]) {
    db.transaction((db) => {
      users.forEach((user) => this.upsert_internal(db, user))
    })
  }

  private upsert_internal(db: Database, user: UserDB) {
    const name = typeof user.name === 'string' ? user.name.trim() : ''
    if (!name || !user.pubkey) return
    const displayName = typeof user.display_name === 'string' ? user.display_name.trim() : ''
    const sql = `
      INSERT INTO users (pubkey, name, display_name)
      VALUES (?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET
        name = excluded.name,
        display_name = excluded.display_name
    `
    db.exec(sql, {
      bind: [user.pubkey, name, displayName || null],
    })
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}
