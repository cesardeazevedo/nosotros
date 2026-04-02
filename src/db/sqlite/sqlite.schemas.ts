import type { Database, SAHPoolUtil } from '@sqlite.org/sqlite-wasm'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { migrate } from './sqlite.migrations'

export function deleteExpiredEvents(db: Database, nowSec = Math.floor(Date.now() / 1000)) {
  const tags = db.selectObjects(
    `
      SELECT tags.eventId, tags.value
      FROM tags
      WHERE tags.tag = 'expiration'
    `,
  ) as { eventId: string; value: string }[]
  let deleted = 0

  for (const tag of tags) {
    if (!/^\d+$/.test(tag.value)) {
      continue
    }
    const expirationSec = Number(tag.value)
    if (!Number.isFinite(expirationSec) || expirationSec > nowSec) {
      continue
    }
    db.exec(`DELETE FROM events WHERE id = ?`, { bind: [tag.eventId] })
    deleted++
  }

  if (deleted > 0) {
    db.exec(`
      DELETE FROM events_fts
      WHERE eventId NOT IN (SELECT id FROM events)
    `)
  }

  return deleted
}

function isCorruptionError(err: unknown) {
  if (!err || typeof err !== 'object' || !('resultCode' in err)) {
    return false
  }

  const resultCode = (err as { resultCode?: unknown }).resultCode
  return typeof resultCode === 'number' && (resultCode & 0xff) === 11
}

function runStartupMaintenance(db: Database) {
  const quickCheck = db.selectValue('PRAGMA quick_check') as string | null
  if (quickCheck && quickCheck !== 'ok') {
    throw new Error(`PRAGMA quick_check failed: ${quickCheck}`)
  }

  deleteExpiredEvents(db)
}

export async function deleteSQLiteFile(filename: string, pool?: SAHPoolUtil) {
  if (pool) {
    await pool.wipeFiles()
    return
  }

  const storage = navigator.storage
  if (!storage?.getDirectory) {
    return
  }

  const root = await storage.getDirectory()
  const file = filename.replace(/^\//, '')
  if (!file) {
    return
  }

  try {
    await root.removeEntry(file)
  } catch {
    // ignore when the file does not exist
  }
}

function build(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT(64) PRIMARY KEY,
      kind INTEGER NOT NULL,
      pubkey TEXT(64) NOT NULL,
      created_at INTEGER NOT NULL,
      content TEXT,
      tags TEXT NOT NULL,
      sig TEXT(128) NOT NULL,
      metadata TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_kind_pubkey_created_at ON events(kind, pubkey, created_at DESC);
    CREATE TABLE IF NOT EXISTS tags (
      eventId TEXT(64) NOT NULL,
      tag TEXT NOT NULL,
      value TEXT NOT NULL,
      kind INTEGER NOT NULL,
      pubkey TEXT(64) NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (eventId, tag, value),
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tags_kind_tag_value_created_at ON tags(kind, tag, value, pubkey, created_at DESC);

    CREATE TABLE IF NOT EXISTS seen (
      eventId TEXT NOT NULL,
      relay TEXT NOT NULL,
      created_at INT NOT NULL,
      PRIMARY KEY (eventId, relay)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_seen_eventId_relay ON seen(eventId, relay, created_at DESC);

    CREATE TABLE IF NOT EXISTS relayInfo (
      url TEXT PRIMARY KEY,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS relayStats (
      url TEXT PRIMARY KEY,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS nip05 (
      nip05 TEXT PRIMARY KEY,
      pubkey TEXT NOT NULL,
      relays TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      pubkey TEXT(64) PRIMARY KEY,
      name TEXT NOT NULL,
      display_name TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_name ON users(name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name COLLATE NOCASE);

    CREATE VIRTUAL TABLE IF NOT EXISTS events_fts USING fts5(
      eventId UNINDEXED,
      content,
      tokenize = 'unicode61 remove_diacritics 2',
      detail = none
    );

    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      created_at INTEGER
    );
  `)
}

export async function initializeSQLite(name: string = 'nosotrosdb.sqlite3', tracing = true) {
  try {
    console.log('Loading and initializing SQLite3 module...')
    let startupCorruptionDetected = false

    type Sqlite3Runtime = {
      installOpfsSAHPoolVfs?: (opts: { initialCapacity: number }) => Promise<SAHPoolUtil>
      oo1: {
        OpfsDb: new (filename: string, flags: string) => Database
        DB: new (filename: string, flags: string) => Database
      }
      opfs?: unknown
    }

    const sqlite3 = await (
      sqlite3InitModule as unknown as (config: {
        print: typeof console.log
        printErr: typeof console.error
      }) => Promise<Sqlite3Runtime>
    )({
      print: console.log,
      printErr: (...args: unknown[]) => {
        console.error(...args)
        const message = args.map(String).join(' ')
        if (message.includes('SQLITE_CORRUPT')) {
          startupCorruptionDetected = true
        }
      },
    })

    const flags = tracing ? 'ct' : 'c'
    const filename = `/${name}`
    const runInit = (db: Database) => {
      startupCorruptionDetected = false
      build(db)
      migrate(db)
      runStartupMaintenance(db)
      if (startupCorruptionDetected) {
        throw new Error('SQLite corruption reported during startup')
      }
    }

    const initializeDb = async (db: Database, pool?: SAHPoolUtil) => {
      try {
        runInit(db)
        return { db, pool }
      } catch (err) {
        if (!isCorruptionError(err) && !startupCorruptionDetected) {
          throw err
        }

        const trigger = isCorruptionError(err) ? 'resultCode' : 'printErr'
        if (tracing) {
          console.error(`SQLite corruption detected for ${filename} via ${trigger}, wiping and recreating`, err)
        }

        if (db.isOpen()) {
          db.close()
        }

        if (pool) {
          await deleteSQLiteFile(filename, pool)
          try {
            const retriedDb = new pool.OpfsSAHPoolDb(filename)
            runInit(retriedDb)
            return { db: retriedDb, pool }
          } catch (retryErr) {
            if (tracing) {
              console.error('wipeFiles recovery failed, escalating to removeVfs', retryErr)
            }

            await pool.removeVfs()
            const freshPool = await sqlite3.installOpfsSAHPoolVfs!({ initialCapacity: 24 })
            const freshDb = new freshPool.OpfsSAHPoolDb(filename)
            runInit(freshDb)
            return { db: freshDb, pool: freshPool }
          }
        }

        await deleteSQLiteFile(filename)
        const retriedDb = hasOpfs
          ? new sqlite3.oo1.OpfsDb(filename, flags)
          : new sqlite3.oo1.DB(filename, flags)

        runInit(retriedDb)
        return { db: retriedDb }
      }
    }

    try {
      if (typeof sqlite3.installOpfsSAHPoolVfs === 'function') {
        const pool = (await sqlite3.installOpfsSAHPoolVfs({ initialCapacity: 24 })) as SAHPoolUtil
        const db = new pool.OpfsSAHPoolDb(filename)
        if (tracing) {
          console.log(`Using VFS: opfs-sahpool -> ${filename}`)
        }
        return await initializeDb(db, pool)
      }
    } catch (e) {
      if (tracing) {
        console.log('opfs-sahpool unavailable, falling back to OPFS/regular DB', e)
      }
    }

    const hasOpfs = 'opfs' in sqlite3

    const db = hasOpfs
      ? new sqlite3.oo1.OpfsDb(filename, flags) // persisted OPFS
      : new sqlite3.oo1.DB(filename, flags) // in-memory

    if (tracing) {
      console.log(
        hasOpfs
          ? `OPFS available, created persisted database at ${db.filename}`
          : `OPFS not available, created transient database ${db.filename}`,
      )
    }

    return await initializeDb(db)
  } catch (err) {
    const error = err as Error
    const msg = `Initialization error: ${error.message}`
    console.error(msg)
    return Promise.reject(msg)
  }
}
