import type { DB } from 'db/types'
import type * as idb from 'idb'
import { IDBEventStore } from './events/idb.events'
import { buildDB } from './idb.builder'
import { schemas, type IndexedDBSchema } from './idb.schemas'
import { IDBMetadata } from './metadata/idb.metadata'
import { IDBNip05 } from './nip05/idb.nip05'
import { IDBRelayInfo } from './relayInfo/idb.relayInfo'
import { IDBRelayStats } from './relayStats/idb.relayStats'
import { IDBSeenStore } from './seen/idb.seen'
import { IDBStats } from './stats/idb.stats'

const DB_VERSION = 14

export class IDBStorage implements DB {
  db: Promise<idb.IDBPDatabase<IndexedDBSchema>>

  seen: IDBSeenStore
  event: IDBEventStore
  relayStats: IDBRelayStats
  relayInfo: IDBRelayInfo
  metadata: IDBMetadata
  stats: IDBStats
  nip05: IDBNip05

  constructor(name: string) {
    this.db = buildDB(name, DB_VERSION, schemas)

    this.seen = new IDBSeenStore(this.db)
    this.event = new IDBEventStore(this.db)
    this.relayStats = new IDBRelayStats(this.db)
    this.relayInfo = new IDBRelayInfo(this.db)
    this.metadata = new IDBMetadata(this.db)
    this.stats = new IDBStats(this.db)
    this.nip05 = new IDBNip05(this.db)
  }

  async export() {
    const db = await this.db
    const tx = db.transaction('events', 'readonly')
    const events = tx.objectStore('events')
    let csvContent = ''
    const writer = new WritableStream({
      write(chunk) {
        csvContent += chunk
      },
    }).getWriter()

    const data = await events.getAll()
    for (const row of data) {
      await writer.write(JSON.stringify(row) + '\n')
    }
    await writer.close()
    const blob = new Blob([csvContent], { type: 'text/txt' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exported.txt'
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  async deleteMetadata() {
    const db = await this.db
    await db.clear('metadata')
  }

  async deleteEvents() {
    const db = await this.db
    await db.clear('events')
  }

  async deleteTags() {
    const db = await this.db
    await db.clear('tags')
  }

  async clearDB() {
    const db = await this.db
    for (const name of db.objectStoreNames) {
      await db.clear(name)
    }
  }
}
