import type { Nip05DB, Nip05Stored } from '@/db/types'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'

export class SqliteNip05 {
  batcher: InsertBatcher<Nip05DB>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (data) => {
      this.insertBatch(await this.db, data)
    })
  }

  query(db: Database, handles: string[]) {
    const conditions = []
    if (handles.length) {
      conditions.push(`WHERE nip05 IN (${handles.map(() => '?').join(',')})`)
    }
    const sql = `SELECT * FROM nip05 ${conditions.join(' AND ')}`
    const res = db.selectObjects(sql, handles) as unknown as Nip05Stored[]
    return res.map((nip05) => ({ ...nip05, relays: JSON.parse(nip05.relays) }) as Nip05DB)
  }

  insert(relayStats: Nip05DB) {
    this.batcher.next(relayStats)
  }

  private insertBatch(db: Database, relayStats: Nip05DB[]) {
    db.transaction((db) => {
      relayStats.forEach((stats) => this._insert(db, stats))
    })
  }

  private _insert(db: Database, data: Nip05DB) {
    const query = `
      INSERT INTO nip05 (nip05, pubkey, relays, timestamp)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(nip05) DO UPDATE SET
        relays = excluded.relays,
        timestamp = excluded.timestamp
    `
    if (data.pubkey.length === 64) {
      db.exec(query, { bind: [data.nip05, data.pubkey, JSON.stringify(data.relays), data.timestamp] })
    }
  }
}
