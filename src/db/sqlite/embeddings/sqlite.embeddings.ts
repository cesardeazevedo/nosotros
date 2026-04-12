import { Kind } from '@/constants/kinds'
import type { Database } from '@sqlite.org/sqlite-wasm'
import type { NostrEventDB } from '../sqlite.types'

const USER_EMBEDDING_DIMENSION = 64

export type SqliteUserEmbedding = {
  event_id: string
  pubkey: string
  target_pubkey: string
  model_id: string
  created_at: number
  dimension: number
}

type ParsedUserEmbedding = SqliteUserEmbedding & {
  vector: Uint8Array
}

export function createUserEmbeddingsSchema(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_embeddings (
      event_id TEXT(64) PRIMARY KEY,
      pubkey TEXT(64) NOT NULL,
      target_pubkey TEXT(64) NOT NULL,
      model_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      dimension INTEGER NOT NULL,
      vector BLOB NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_user_embeddings_target_model_created_at
      ON user_embeddings(target_pubkey, model_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_embeddings_model_created_at
      ON user_embeddings(model_id, created_at DESC);
  `)

  db.exec(
    `SELECT vector_init('user_embeddings', 'vector', 'type=FLOAT32,dimension=${USER_EMBEDDING_DIMENSION},distance=COSINE')`,
  )
}

export class SqliteUserEmbeddings {
  insertEvent(db: Database, event: NostrEventDB) {
    const embedding = parseUserEmbeddingEvent(event)
    if (!embedding) {
      return undefined
    }

    db.exec(
      `
        INSERT INTO user_embeddings (
          event_id,
          pubkey,
          target_pubkey,
          model_id,
          created_at,
          dimension,
          vector
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(event_id) DO UPDATE SET
          pubkey = excluded.pubkey,
          target_pubkey = excluded.target_pubkey,
          model_id = excluded.model_id,
          created_at = excluded.created_at,
          dimension = excluded.dimension,
          vector = excluded.vector
      `,
      {
        bind: [
          embedding.event_id,
          embedding.pubkey,
          embedding.target_pubkey,
          embedding.model_id,
          embedding.created_at,
          embedding.dimension,
          embedding.vector,
        ],
      },
    )
    return embedding
  }

  delete(db: Database, eventId: string) {
    db.exec(`DELETE FROM user_embeddings WHERE event_id = ?`, { bind: [eventId] })
  }

  queryByPubkeys(db: Database, pubkeys: string[]) {
    if (!pubkeys.length) {
      return []
    }

    const rows = db.selectObjects(
      `
        SELECT event_id, pubkey, target_pubkey, model_id, created_at, dimension
        FROM user_embeddings
        WHERE target_pubkey IN (${pubkeys.map(() => '?').join(',')})
        ORDER BY created_at DESC
      `,
      pubkeys,
    )

    return rows as SqliteUserEmbedding[]
  }

  queryNearestToPubkey(db: Database, pubkey: string, limit = 50, offset = 0) {
    const current = db.selectObject(
      `
        SELECT vector, model_id, created_at
        FROM user_embeddings
        WHERE target_pubkey = ?
        ORDER BY created_at DESC, rowid DESC
        LIMIT 1
      `,
      [pubkey],
    ) as { vector: Uint8Array; model_id: string; created_at: number } | undefined

    if (!current) {
      return []
    }

    const scanLimit = Math.max(limit * 4, limit + 16)
    const nearestSql = `
      WITH ranked AS (
        SELECT
          rowid,
          target_pubkey,
          model_id,
          created_at,
          vector,
          ROW_NUMBER() OVER (
            PARTITION BY target_pubkey, model_id
            ORDER BY created_at DESC, rowid DESC
          ) AS rn
        FROM user_embeddings
      ),
      nearest AS (
        SELECT
          ranked.target_pubkey AS pubkey,
          ranked.model_id,
          ranked.created_at,
          v.distance,
          1 - v.distance AS similarity,
          ranked.vector,
          0 AS is_anchor
        FROM vector_full_scan('user_embeddings', 'vector', ?, ?) AS v
        INNER JOIN ranked ON ranked.rowid = v.rowid
        WHERE
          ranked.rn = 1 AND
          ranked.model_id = ? AND
          ranked.target_pubkey != ?
        ORDER BY v.distance ASC
        LIMIT ?
        OFFSET ?
      )
    `
    const rows = db.selectObjects(
      offset === 0
        ? `
        ${nearestSql}
        SELECT * FROM (
          SELECT
            ? AS pubkey,
            ? AS model_id,
            ? AS created_at,
            0 AS distance,
            1 AS similarity,
            ? AS vector,
            1 AS is_anchor
          UNION ALL
          SELECT * FROM nearest
        )
        ORDER BY is_anchor DESC, distance ASC
      `
        : `
        ${nearestSql}
        SELECT * FROM nearest
        ORDER BY distance ASC
      `,
      offset === 0
        ? [
            current.vector,
            scanLimit,
            current.model_id,
            pubkey,
            limit,
            offset,
            pubkey,
            current.model_id,
            current.created_at,
            current.vector,
          ]
        : [current.vector, scanLimit, current.model_id, pubkey, limit, offset],
    ) as Array<{
      pubkey: string
      model_id: string
      created_at: number
      distance: number
      similarity: number
      vector: Uint8Array
      is_anchor: number
    }>

    return rows.map((row) => ({
      ...row,
      vector: Array.from(vectorBlobToFloat32Array(row.vector)),
      is_anchor: !!row.is_anchor,
    }))
  }
}

export function parseUserEmbeddingEvent(event: NostrEventDB): ParsedUserEmbedding | undefined {
  if (event.kind !== Kind.UserEmbeddings) {
    return
  }

  const targetPubkey = event.tags.find((tag) => tag[0] === 'p')?.[1]
  const modelId = event.tags.find((tag) => tag[0] === 'model_id')?.[1]
  const vectorTag = event.tags.find((tag) => tag[0] === 'vector')?.[1]
  if (!targetPubkey || !modelId || !vectorTag) {
    return
  }

  const vector = parseVectorTag(vectorTag)
  if (!vector || vector.length !== USER_EMBEDDING_DIMENSION) {
    return
  }

  return {
    event_id: event.id,
    pubkey: event.pubkey,
    target_pubkey: targetPubkey,
    model_id: modelId,
    created_at: event.created_at,
    dimension: vector.length,
    vector: new Uint8Array(vector.buffer),
  }
}

function parseVectorTag(vectorTag: string) {
  try {
    const parsed = JSON.parse(vectorTag)
    if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === 'number' && Number.isFinite(value))) {
      return
    }
    return Float32Array.from(parsed)
  } catch {
    return
  }
}

function vectorBlobToFloat32Array(vector: Uint8Array) {
  return new Float32Array(vector.buffer, vector.byteOffset, vector.byteLength / Float32Array.BYTES_PER_ELEMENT)
}
