import type { Database } from '@sqlite.org/sqlite-wasm'

type TagQuery = {
  tag: string
  query?: string
  limit?: number
}

export class SqliteTags {
  queryValues(db: Database, params: TagQuery) {
    const tag = params.tag
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 500)
    const query = params.query?.trim()
    const hasQuery = !!query

    const sql = `
      SELECT value
      FROM tags
      WHERE tag = ?
      ${hasQuery ? "AND value LIKE ? ESCAPE '\\\\'" : ''}
      GROUP BY value
      ORDER BY COUNT(*) DESC, MAX(created_at) DESC
      LIMIT ?
    `
    const bind = hasQuery ? [tag, `%${escapeLike(query!)}%`, limit] : [tag, limit]
    const rows = db.selectArrays(sql, bind) as unknown as Array<[string]>
    return (rows || []).map(([value]) => value)
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}
