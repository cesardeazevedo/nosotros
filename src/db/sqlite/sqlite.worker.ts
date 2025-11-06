import { type Database, type SAHPoolUtil } from '@sqlite.org/sqlite-wasm'
import invariant from 'tiny-invariant'
import { SqliteEventStore } from './events/sqlite.events'
import { SqliteNip05 } from './nip05/sqlite.nip05'
import { SqliteRelayInfo } from './relayInfo/sqlite.relayInfo'
import { SqliteRelayStats } from './relayStats/sqlite.relayStats'
import { SqliteSeen } from './seen/sqlite.seen'
import { initializeSQLite } from './sqlite.schemas'
import { SqliteStats } from './sqlite.stats'
import type { SqliteMessages } from './sqlite.types'

export class SqliteStorage {
  db: Promise<Database>
  pool: Promise<SAHPoolUtil | undefined>
  event: SqliteEventStore
  relayStats: SqliteRelayStats
  relayInfo: SqliteRelayInfo
  nip05: SqliteNip05
  seen: SqliteSeen
  stats: SqliteStats

  constructor(public name: string) {
    const init = initializeSQLite(this.name, false)
    this.db = init.then((r) => r.db)
    this.pool = init.then((r) => r.pool)
    this.event = new SqliteEventStore(this.db)
    this.relayInfo = new SqliteRelayInfo(this.db)
    this.relayStats = new SqliteRelayStats(this.db)
    this.nip05 = new SqliteNip05(this.db)
    this.seen = new SqliteSeen(this.db)
    this.stats = new SqliteStats()
  }

  async deleteDB() {
    const db = await this.db
    db.exec('DELETE FROM events')
    db.exec('DELETE FROM tags')
    db.exec('DELETE FROM relayStats')
    db.exec('DELETE FROM relayInfo')
    db.exec('DELETE FROM seen')
    db.exec('DELETE FROM nip05')
  }

  async exportDB() {
    const db = await this.db
    const pool = await this.pool
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
    invariant(pool, 'SAH pool not available')
    return pool.exportFile(`/${DB_NAME}`)
  }
}

const DB_NAME = import.meta.env.VITE_DB_NAME
const store = new SqliteStorage(DB_NAME)

async function onMessage(e: MessageEvent) {
  const db = await store.db
  const msg = JSON.parse(e.data) as SqliteMessages & { id: string }
  switch (msg.method) {
    case 'initialize': {
      break
    }
    case 'exists': {
      const res = store.event.getById(db, msg.params)
      postMessage(msg, res)
      break
    }
    case 'existsReplaceable': {
      const res = store.event.getReplaceable(db, ...msg.params)
      postMessage(msg, res)
      break
    }
    case 'existsAddressable': {
      const res = store.event.getAddressable(db, ...msg.params)
      postMessage(msg, res)
      break
    }
    case 'queryEvent': {
      const events = store.event.query(db, msg.params)
      postMessage(msg, events)
      break
    }
    case 'insertEvent': {
      store.event.insert(msg.params)
      break
    }
    case 'deleteEvent': {
      store.event.delete(db, msg.params)
      break
    }
    case 'querySeen': {
      const seen = store.seen.query(db, msg.params)
      postMessage(msg, seen)
      break
    }
    case 'insertSeen': {
      store.seen.insert(msg.params)
      break
    }
    case 'queryRelayStats': {
      const stats = store.relayStats.query(db, msg.params)
      postMessage(msg, stats)
      break
    }
    case 'insertRelayStats': {
      store.relayStats.insert(msg.params)
      break
    }
    case 'queryRelayInfo': {
      const stats = store.relayInfo.query(db, msg.params)
      postMessage(msg, stats)
      break
    }
    case 'insertRelayInfo': {
      store.relayInfo.insert(msg.params)
      break
    }
    case 'queryNip05': {
      const res = store.nip05.query(db, msg.params)
      postMessage(msg, res)
      break
    }
    case 'insertNip05': {
      store.nip05.insert(msg.params)
      break
    }
    case 'countEvents': {
      const res = store.stats.countEvents(db)
      postMessage(msg, res)
      break
    }
    case 'countTags': {
      const res = store.stats.countTags(db)
      postMessage(msg, res)
      break
    }
    case 'dbSize ': {
      const bytes = store.stats.dbSizeBytes(db)
      postMessage(msg, bytes)
      break
    }
    case 'exportDB': {
      const res = await store.exportDB()
      postMessage(msg, res)
      break
    }
    case 'deleteDB': {
      await store.deleteDB()
      postMessage(msg, { success: true })
      break
    }
    default: {
      break
    }
  }
}

function postMessage<T>(msg: SqliteMessages & { id: string }, data: T) {
  const payload = {
    id: msg.id,
    result: data,
  }
  if (data instanceof Uint8Array) {
    self.postMessage(payload, [data.buffer])
    return
  }
  self.postMessage(JSON.stringify(payload))
}

self.onmessage = onMessage
