import type { RelayStatsDB } from '@/db/types'
import type { RelayStatsDBMap } from '@/nostr/db/queryRelayStats'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'
import type { RelayStatsStored } from '../sqlite.types'

export class SqliteRelayStats {
  batcher: InsertBatcher<RelayStatsDB>

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
    const sql = `SELECT * FROM relayStats ${conditions.join(' AND ')}`
    const res = db.selectObjects(sql, urls) as unknown as RelayStatsStored[]
    return res
      .map((stat) => ({ ...stat, ...JSON.parse(stat.data) }) as RelayStatsDB)
      .reduce((acc, stat) => ({ ...acc, [stat.url]: stat }), {} as RelayStatsDBMap)
  }

  insert(relayStats: RelayStatsDB) {
    this.batcher.next(relayStats)
  }

  private insertBatch(db: Database, relayStats: RelayStatsDB[]) {
    db.transaction((db) => {
      relayStats.forEach((stats) => this._insert(db, stats))
    })
  }

  private _insert(db: Database, data: RelayStatsDB) {
    const { url, ...rest } = data
    const query = `
      INSERT INTO relayStats (url, data) 
      VALUES (?, ?)
      ON CONFLICT(url) DO UPDATE SET
        data = excluded.data
    `
    db.exec(query, { bind: [url, JSON.stringify(rest)] })
  }
}
