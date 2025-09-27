import { dedupe } from '@/core/helpers/dedupe'
import type { Database } from '@sqlite.org/sqlite-wasm'

function newVersion(db: Database, version: number) {
  db.exec('INSERT INTO migrations (version, created_at) VALUES (?, ?)', { bind: [version, Date.now() / 1000] })
}

export function migrate(db: Database) {
  const version = (db.selectValue('SELECT MAX(version) FROM migrations') || 0) as number
  if (version < 1) {
    newVersion(db, 1)
  }
  if (version < 2) {
    // relay list events with wrong tag
    const res = db.selectArrays(`SELECT eventId FROM tags WHERE kind = 10002 AND tag = 'relay'`) || []
    const ids = dedupe(res.flat())
    db.exec(`DELETE FROM events WHERE id IN (${ids.map(() => '?').join(',')})`, { bind: ids })
    newVersion(db, 2)
  }
}
