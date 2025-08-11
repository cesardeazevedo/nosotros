import type { SeenDB } from '@/db/types'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'

export class SqliteSeen {
  batcher: InsertBatcher<SeenDB>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (data) => {
      this.insertBatch(await this.db, data)
    }, 5000)
  }

  query(db: Database, id: string): SeenDB[] | undefined {
    const sql = `SELECT * FROM seen WHERE eventId = ? LIMIT 1`
    const res = db.selectObjects(sql, [id])
    return res as unknown as SeenDB[]
  }

  insert(seen: SeenDB) {
    this.batcher.next(seen)
  }

  private insertBatch(db: Database, seen: SeenDB[]) {
    db.transaction((db) => {
      seen.forEach((meta) => {
        this._insert(db, meta)
      })
    })
  }

  private _insert(db: Database, data: SeenDB): void {
    db.exec('INSERT OR IGNORE INTO seen (eventId, relay, created_at) VALUES (?, ?, ?)', {
      bind: [data.eventId, data.relay, data.created_at],
    })
  }
}
