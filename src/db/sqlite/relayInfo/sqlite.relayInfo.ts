import type { Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'
import type { RelayInfoStored } from '../sqlite.types'
import type { RelayInfoDB } from '@/db/types'

export class SqliteRelayInfo {
  batcher: InsertBatcher<RelayInfoStored>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (data) => {
      this.insertBatch(await this.db, data)
    }, 5000)
  }

  query(db: Database, urls: string[]) {
    const conditions = []
    if (urls.length) {
      conditions.push(`WHERE url IN (${urls.map(() => '?').join(',')})`)
    }
    const sql = `SELECT * FROM relayInfo ${conditions.join(' AND ')}`
    const res = db.selectObjects(sql, urls) as unknown as RelayInfoStored[]
    return res.map((info) => ({ ...info, ...JSON.parse(info.data) }) as RelayInfoDB)
  }

  insert(relayInfo: RelayInfoStored) {
    this.batcher.next(relayInfo)
  }

  private insertBatch(db: Database, relayInfoList: RelayInfoStored[]) {
    db.transaction((db) => {
      relayInfoList.forEach((info) => this._insert(db, info))
    })
  }

  private _insert(db: Database, data: RelayInfoStored) {
    const query = `
      INSERT INTO relayInfo (url, data)
      VALUES (?, ?)
      ON CONFLICT(url) DO UPDATE SET
        data = excluded.data
    `
    db.exec(query, { bind: [data.url, data.data] })
  }
}
