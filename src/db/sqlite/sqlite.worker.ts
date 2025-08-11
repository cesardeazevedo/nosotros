import type { Database } from '@sqlite.org/sqlite-wasm'
import { SqliteEventStore } from './events/sqlite.events'
import { SqliteNip05 } from './nip05/sqlite.nip05'
import { SqliteRelayInfo } from './relayInfo/sqlite.relayInfo'
import { SqliteRelayStats } from './relayStats/sqlite.relayStats'
import { SqliteSeen } from './seen/sqlite.seen'
import { initializeSQLite } from './sqlite.schemas'
import type { SqliteMessages } from './sqlite.types'

export class SqliteStorage {
  db: Promise<Database>
  event: SqliteEventStore
  relayStats: SqliteRelayStats
  relayInfo: SqliteRelayInfo
  nip05: SqliteNip05
  seen: SqliteSeen

  constructor(name: string) {
    this.db = initializeSQLite(name, false)
    this.event = new SqliteEventStore(this.db)
    this.relayInfo = new SqliteRelayInfo(this.db)
    this.relayStats = new SqliteRelayStats(this.db)
    this.nip05 = new SqliteNip05(this.db)
    this.seen = new SqliteSeen(this.db)
  }

  clearDB(): Promise<void> {
    throw new Error('Method not implemented.')
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
      const events = store.event.exists(db, msg.params)
      postMessage(msg, events)
      break
    }
    case 'getById': {
      const events = store.event.getById(db, msg.params)
      postMessage(msg, events)
      break
    }
    case 'getRawEventById': {
      const events = store.event.getRawEventById(db, msg.params)
      postMessage(msg, events)
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
      store.nip05.query(db, msg.params)
      break
    }
    case 'insertNip05': {
      store.nip05.insert(msg.params)
      break
    }
    default: {
      break
    }
  }
}

function postMessage<T>(msg: SqliteMessages & { id: string }, data: T) {
  const response = {
    id: msg.id,
    result: data,
  }
  self.postMessage(JSON.stringify(response))
}

self.onmessage = onMessage
