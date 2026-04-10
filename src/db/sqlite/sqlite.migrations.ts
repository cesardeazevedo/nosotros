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
    if (ids.length > 0) {
      db.exec(`DELETE FROM events WHERE id IN (${ids.map(() => '?').join(',')})`, { bind: ids })
    }
    newVersion(db, 2)
  }
  if (version < 3) {
    const rows =
      (db.selectObjects(
        `SELECT pubkey, content FROM events WHERE kind = 0`,
      ) as Array<{ pubkey: string; content?: string }>) || []

    if (rows.length) {
      db.transaction((db) => {
        rows.forEach((row) => {
          const { name, display_name } = parseUserContent(row.content)
          const resolvedName = (name || display_name || '').trim()
          const resolvedDisplay = display_name?.trim() || undefined
          if (!resolvedName || !row.pubkey) return
          db.exec(
            `
              INSERT INTO users (pubkey, name, display_name)
              VALUES (?, ?, ?)
              ON CONFLICT(pubkey) DO UPDATE SET
                display_name = excluded.display_name,
                name = CASE WHEN users.name = '' THEN excluded.name ELSE users.name END
            `,
            { bind: [row.pubkey, resolvedName, resolvedDisplay ?? null] },
          )
        })
      })
    }

    newVersion(db, 3)
  }
}

function parseUserContent(content?: string) {
  try {
    const parsed = JSON.parse(content || '{}') as { name?: string; display_name?: string }
    return {
      name: parsed.name?.trim() || undefined,
      display_name: parsed.display_name?.trim() || undefined,
    }
  } catch {
    return { name: undefined, display_name: undefined }
  }
}
