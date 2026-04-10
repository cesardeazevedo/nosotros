import { Kind } from '@/constants/kinds'
import type { UserDB } from '@/db/types'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'
import type { SqliteHybridUserSearchResult } from '../sqlite.types'

type UserQuery = {
  prefix: string
  limit?: number
}

type UserEmbeddingQuery = UserQuery & {
  vector: number[]
  modelId?: string
  candidateLimit?: number
}

type EmbeddedPubkeysQuery = {
  pubkeys: string[]
  modelId?: string
}

export function queryUserPubkeys(db: Database, params: UserQuery) {
  const prefix = params.prefix.trim()
  if (!prefix) return []
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
  const sql = `
    SELECT pubkey
    FROM (
      SELECT pubkey, name, display_name
      FROM users
      WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
      UNION
      SELECT pubkey, name, display_name
      FROM users
      WHERE display_name LIKE ? ESCAPE '\\' COLLATE NOCASE
    )
    ORDER BY COALESCE(NULLIF(display_name, ''), name) COLLATE NOCASE ASC
    LIMIT ?
  `
  const like = `${escapeLike(prefix)}%`
  const res = db.selectObjects(sql, [like, like, limit]) as Array<{ pubkey: string }> | undefined
  return (res || []).map((row) => row.pubkey)
}

export class SqliteUsers {
  batcher: InsertBatcher<UserDB>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (data) => {
      this.insertBatch(await this.db, data)
    })
  }

  query(db: Database, params: UserQuery) {
    const prefix = params.prefix.trim()
    if (!prefix) return []
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
    const sql = `
      SELECT pubkey, name, display_name
      FROM (
        SELECT pubkey, name, display_name
        FROM users
        WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
        UNION
        SELECT pubkey, name, display_name
        FROM users
        WHERE display_name LIKE ? ESCAPE '\\' COLLATE NOCASE
      )
      ORDER BY COALESCE(NULLIF(display_name, ''), name) COLLATE NOCASE ASC
      LIMIT ?
    `
    const like = `${escapeLike(prefix)}%`
    return db.selectObjects(sql, [like, like, limit]) as unknown as UserDB[]
  }

  queryWithEmbeddings(db: Database, params: UserQuery & { modelId?: string }) {
    const prefix = params.prefix.trim()
    if (!prefix) return []

    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
    const like = `${escapeLike(prefix)}%`

    return db.selectObjects(
      `
        WITH candidates AS (
          SELECT pubkey, name, display_name
          FROM (
            SELECT pubkey, name, display_name
            FROM users
            WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
            UNION
            SELECT pubkey, name, display_name
            FROM users
            WHERE display_name LIKE ? ESCAPE '\\' COLLATE NOCASE
          )
        ),
        ranked AS (
          SELECT
            ue.target_pubkey AS pubkey,
            ROW_NUMBER() OVER (
              PARTITION BY ue.target_pubkey
              ORDER BY ue.created_at DESC, ue.rowid DESC
            ) AS rn
          FROM user_embeddings ue
          INNER JOIN candidates c ON c.pubkey = ue.target_pubkey
          ${params.modelId ? 'WHERE ue.model_id = ?' : ''}
        ),
        latest_rank AS (
          SELECT
            t.pubkey,
            CAST(t.value AS REAL) AS rank_value,
            ROW_NUMBER() OVER (
              PARTITION BY t.pubkey
              ORDER BY t.created_at DESC
            ) AS rn
          FROM tags t
          INNER JOIN candidates c ON c.pubkey = t.pubkey
          WHERE t.kind = ${Kind.TrustedAssertionUser} AND t.tag = 'rank'
        )
        SELECT c.pubkey, c.name, c.display_name
        FROM candidates c
        INNER JOIN ranked ON ranked.pubkey = c.pubkey
        LEFT JOIN latest_rank ON latest_rank.pubkey = c.pubkey AND latest_rank.rn = 1
        WHERE ranked.rn = 1
        ORDER BY COALESCE(latest_rank.rank_value, -1) DESC, COALESCE(NULLIF(c.display_name, ''), c.name) COLLATE NOCASE ASC
        LIMIT ?
      `,
      params.modelId ? [like, like, params.modelId, limit] : [like, like, limit],
    ) as unknown as UserDB[]
  }

  queryEmbeddedPubkeys(db: Database, params: EmbeddedPubkeysQuery) {
    const pubkeys = Array.from(new Set(params.pubkeys.filter(Boolean)))
    if (pubkeys.length === 0) {
      return []
    }

    const placeholders = pubkeys.map(() => '?').join(', ')
    const sql = `
      SELECT DISTINCT ue.target_pubkey AS pubkey
      FROM user_embeddings ue
      WHERE ue.target_pubkey IN (${placeholders})
      ${params.modelId ? 'AND ue.model_id = ?' : ''}
    `
    const rows = db.selectObjects(
      sql,
      params.modelId ? [...pubkeys, params.modelId] : pubkeys,
    ) as Array<{ pubkey: string }> | undefined

    return (rows || []).map((row) => row.pubkey)
  }

  queryByEmbedding(db: Database, params: UserEmbeddingQuery) {
    const prefix = params.prefix.trim()
    const vector = params.vector
    if (!prefix || vector.length === 0 || vector.some((value) => !Number.isFinite(value))) {
      return []
    }

    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50)
    const candidateLimit = Math.min(Math.max(params.candidateLimit ?? Math.max(limit * 4, 50), limit), 200)
    const like = `${escapeLike(prefix)}%`

    const rows = db.selectObjects(
      `
        WITH candidates AS (
          SELECT pubkey, name, display_name
          FROM (
            SELECT pubkey, name, display_name
            FROM users
            WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
            UNION
            SELECT pubkey, name, display_name
            FROM users
            WHERE display_name LIKE ? ESCAPE '\\' COLLATE NOCASE
          )
          ORDER BY COALESCE(NULLIF(display_name, ''), name) COLLATE NOCASE ASC
          LIMIT ?
        ),
        ranked AS (
          SELECT
            ue.target_pubkey AS pubkey,
            ue.model_id,
            ue.created_at,
            ue.vector,
            ROW_NUMBER() OVER (
              PARTITION BY ue.target_pubkey
              ORDER BY ue.created_at DESC, ue.rowid DESC
            ) AS rn
          FROM user_embeddings ue
          INNER JOIN candidates c ON c.pubkey = ue.target_pubkey
          ${params.modelId ? 'WHERE ue.model_id = ?' : ''}
        )
        SELECT
          c.pubkey,
          c.name,
          c.display_name,
          ranked.model_id,
          ranked.created_at,
          ranked.vector
        FROM candidates c
        INNER JOIN ranked ON ranked.pubkey = c.pubkey
        WHERE ranked.rn = 1
      `,
      params.modelId ? [like, like, candidateLimit, params.modelId] : [like, like, candidateLimit],
    ) as
      | Array<{
          pubkey: string
          name: string
          display_name?: string | null
          model_id: string
          created_at: number
          vector: Uint8Array
        }>
      | undefined

    return (rows || [])
      .map((row) => {
        const candidateVector = vectorBlobToFloat32Array(row.vector)
        const similarity = cosineSimilarity(vector, candidateVector)
        return {
          pubkey: row.pubkey,
          name: row.name,
          display_name: row.display_name || undefined,
          model_id: row.model_id,
          created_at: row.created_at,
          similarity,
          distance: 1 - similarity,
        } satisfies SqliteHybridUserSearchResult
      })
      .filter((row) => Number.isFinite(row.similarity))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  upsert(user: UserDB) {
    const name = typeof user.name === 'string' ? user.name.trim() : ''
    if (!name || !user.pubkey) {
      return
    }
    this.batcher.next({ ...user, name })
  }

  private insertBatch(db: Database, users: UserDB[]) {
    db.transaction((db) => {
      users.forEach((user) => this.upsert_internal(db, user))
    })
  }

  private upsert_internal(db: Database, user: UserDB) {
    const name = typeof user.name === 'string' ? user.name.trim() : ''
    if (!name || !user.pubkey) return
    const displayName = typeof user.display_name === 'string' ? user.display_name.trim() : ''
    const sql = `
      INSERT INTO users (pubkey, name, display_name)
      VALUES (?, ?, ?)
      ON CONFLICT(pubkey) DO UPDATE SET
        name = excluded.name,
        display_name = excluded.display_name
    `
    db.exec(sql, {
      bind: [user.pubkey, name, displayName || null],
    })
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

function vectorBlobToFloat32Array(vector: Uint8Array) {
  return new Float32Array(vector.buffer, vector.byteOffset, vector.byteLength / Float32Array.BYTES_PER_ELEMENT)
}

function cosineSimilarity(left: number[], right: Float32Array) {
  const length = Math.min(left.length, right.length)
  let dot = 0
  let leftNorm = 0
  let rightNorm = 0
  for (let index = 0; index < length; index++) {
    const l = left[index] || 0
    const r = right[index] || 0
    dot += l * r
    leftNorm += l * l
    rightNorm += r * r
  }
  if (leftNorm === 0 || rightNorm === 0) {
    return 0
  }
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm))
}
