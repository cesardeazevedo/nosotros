import type { Database } from '@sqlite.org/sqlite-wasm'

export class SqliteStats {
  countEvents(db: Database) {
    return db.selectValue('SELECT count(*) FROM events') as number
  }

  countTags(db: Database) {
    return db.selectValue('SELECT count(*) FROM tags') as number
  }

  dbSizeBytes(db: Database) {
    const pageSize = db.selectValue('PRAGMA page_size') as number
    const pageCount = db.selectValue('PRAGMA page_count') as number
    return pageSize * pageCount
  }
}
