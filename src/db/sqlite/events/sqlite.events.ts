import { Kind } from '@/constants/kinds'
import { isFilterValid } from '@/core/helpers/isFilterValid'
import type { NostrFilter } from '@/core/types'
import { getDTag } from '@/utils/nip19'
import type { BindableValue, Database } from '@sqlite.org/sqlite-wasm'
import type { NostrEvent } from 'nostr-tools'
import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import { InsertBatcher } from '../batcher'
import type { NostrEventDB, NostrEventExists, NostrEventStored } from '../sqlite.types'

export class SqliteEventStore {
  batcher: InsertBatcher<NostrEventDB>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (events) => {
      this.insertBatch(await this.db, events)
    })
  }

  private formatEvent(event: NostrEventStored) {
    return {
      ...event,
      tags: JSON.parse(event.tags || '{}'),
      metadata: JSON.parse(event.metadata || '{}'),
    } as NostrEventDB
  }

  exists(db: Database, event: NostrEvent) {
    if (isReplaceableKind(event.kind)) {
      return this.getReplaceable(db, event.kind, event.pubkey)
    } else if (isAddressableKind(event.kind)) {
      const dTag = event.tags.find((tag) => tag[1] === 'd')?.[1]
      if (dTag) {
        return this.getAddressable(db, event.kind, event.pubkey, dTag)
      }
    }
    return this.getById(db, event.id)
  }

  getById(db: Database, id: string) {
    const query = `SELECT id, created_at FROM events WHERE id = ? LIMIT 1`
    return db.selectObject(query, [id]) as NostrEventExists | undefined
  }

  getReplaceable(db: Database, kind: Kind, pubkey: string) {
    const query = `SELECT id, created_at FROM events WHERE kind = ? AND pubkey = ? LIMIT 1`
    return db.selectObject(query, [kind, pubkey]) as NostrEventExists | undefined
  }

  getAddressable(db: Database, kind: Kind, pubkey: string, dTag: string) {
    const query = `
      SELECT e.id, e.created_at FROM tags
      INNER JOIN events e on e.id = tags.eventId
      WHERE
          tags.kind = ? AND
          tags.tag = 'd' AND
          tags.pubkey = ? AND
          tags.value = ?
      LIMIT 1
      `
    return db.selectObject(query, [kind, pubkey, dTag]) as NostrEventExists | undefined
  }

  getByIds(db: Database, ids: string[]) {
    const query = `
      SELECT * FROM events
      WHERE id IN (${ids.map(() => '?').join(',')})
    `
    const res = db.selectObjects(query, ids) || []
    return res.map((event) => this.formatEvent(event as NostrEventStored))
  }

  private buildQuery(filter: NostrFilter, relays: string[] = []) {
    const conditions: string[] = []
    const params: BindableValue[] = []
    let needsTagJoin = false
    let tagName = ''
    let tagValues: BindableValue[] = []

    for (const [key, values] of Object.entries(filter)) {
      if (key.startsWith('#') && Array.isArray(values) && values.length > 0) {
        needsTagJoin = true
        tagName = key.slice(1)
        tagValues = values as BindableValue[]

        if (filter.kinds?.length) {
          conditions.push(`tags.kind IN (${filter.kinds.map(() => '?').join(',')})`)
          params.push(...filter.kinds)
        }
        if (typeof filter.since === 'number') {
          conditions.push('tags.created_at >= ?')
          params.push(filter.since)
        }
        if (typeof filter.until === 'number') {
          conditions.push('tags.created_at <= ?')
          params.push(filter.until)
        }
        return { conditions, params, needsTagJoin, tagName, tagValues }
      }
    }

    if (filter.kinds?.length) {
      conditions.push(`kind IN (${filter.kinds.map(() => '?').join(',')})`)
      params.push(...filter.kinds)
    }
    if (filter.authors?.length) {
      conditions.push(`pubkey IN (${filter.authors.map(() => '?').join(',')})`)
      params.push(...filter.authors)
    }
    if (typeof filter.since === 'number') {
      conditions.push('created_at >= ?')
      params.push(filter.since)
    }
    if (typeof filter.until === 'number') {
      conditions.push('created_at <= ?')
      params.push(filter.until)
    }

    if (relays.length > 0) {
      conditions.push(`
      EXISTS (
        SELECT 1 FROM seen s
        WHERE s.eventId = events.id
          AND s.relay IN (${relays.map(() => '?').join(',')})
      )
    `)
      params.push(...relays)
    }

    return { conditions, params, needsTagJoin, tagName, tagValues }
  }

  query(db: Database, filter: NostrFilter, relays: string[] = []) {
    const hasKinds = (filter.kinds?.length ?? 0) > 0
    if (!isFilterValid(filter) && !hasKinds) {
      return []
    }

    if (filter.ids && filter.ids.length) {
      return this.getByIds(db, filter.ids)
    }

    const { conditions, params, needsTagJoin, tagName, tagValues } = this.buildQuery(filter, relays)

    if (needsTagJoin) {
      const query = `
      SELECT DISTINCT e.*
      FROM tags
      INNER JOIN events e on e.id = tags.eventId
      WHERE
        ${conditions.length ? conditions.join(' AND ') : '1'}
        AND tags.tag = '${tagName}'
        AND tags.value IN (${tagValues.map(() => '?')})
      ORDER BY e.created_at DESC
      ${filter.limit ? 'LIMIT ?' : ''}
    `
      params.push(...tagValues)
      if (filter.limit) {
        params.push(filter.limit)
      }
      const res = db.selectObjects(query, params)
      return res.map((event) => this.formatEvent(event as NostrEventStored))
    }

    const query = `
    SELECT * FROM events
    WHERE ${conditions.length ? conditions.join(' AND ') : '1'}
    ORDER BY created_at DESC
    ${filter.limit ? 'LIMIT ?' : ''}
  `
    if (filter.limit) {
      params.push(filter.limit)
    }

    const res = db.selectObjects(query, params) || []
    return res.map((event) => this.formatEvent(event as NostrEventStored))
  }

  queryNeg(db: Database, filter: NostrFilter) {
    const hasKinds = (filter.kinds?.length ?? 0) > 0
    if (!isFilterValid(filter) && !hasKinds) {
      return []
    }

    if (filter.ids && filter.ids.length) {
      const query = `
      SELECT id, created_at FROM events
      WHERE id IN (${filter.ids.map(() => '?').join(',')})
      ORDER BY created_at DESC, id ASC
    `
      return db.selectObjects(query, filter.ids) as NostrEventExists[]
    }

    const { conditions, params, needsTagJoin, tagName, tagValues } = this.buildQuery(filter)

    if (needsTagJoin) {
      const query = `
      SELECT DISTINCT e.id, e.created_at
      FROM tags
      INNER JOIN events e on e.id = tags.eventId
      WHERE
        ${conditions.length ? conditions.join(' AND ') : '1'}
        AND tags.tag = '${tagName}'
        AND tags.value IN (${tagValues.map(() => '?')})
      ORDER BY e.created_at DESC, e.id DESC
      ${filter.limit ? 'LIMIT ?' : ''}
    `
      params.push(...tagValues)
      if (filter.limit) {
        params.push(filter.limit)
      }
      return db.selectObjects(query, params) as NostrEventExists[]
    }

    const query = `
    SELECT id, created_at FROM events
    WHERE ${conditions.length ? conditions.join(' AND ') : '1'}
    ORDER BY created_at DESC, id ASC
    ${filter.limit ? 'LIMIT ?' : ''}
  `
    if (filter.limit) {
      params.push(filter.limit)
    }

    return db.selectObjects(query, params) as NostrEventExists[]
  }

  count(db: Database, filter: NostrFilter) {
    const res = this.query(db, filter)
    return res.length
  }

  insertBatch(db: Database, events: NostrEventDB[]) {
    db.transaction((db) => {
      events.forEach((event) => this.insertEvent(db, event))
    })
  }

  insert(event: NostrEventDB) {
    this.batcher.next(event)
  }

  private hasDeleteRequestForEvent(db: Database, event: NostrEventDB) {
    const byId = db.selectObject(
      `
        SELECT 1 as found
        FROM tags
        WHERE kind = ? AND tag = 'e' AND value = ? AND pubkey = ? AND created_at >= ?
        LIMIT 1
      `,
      [Kind.EventDeletion, event.id, event.pubkey, event.created_at],
    ) as { found: number } | undefined

    if (byId?.found) {
      return true
    }

    if (isAddressableKind(event.kind)) {
      const dTag = getDTag(event)
      if (!dTag) {
        return false
      }
      const address = `${event.kind}:${event.pubkey}:${dTag}`
      const byAddress = db.selectObject(
        `
          SELECT 1 as found
          FROM tags
          WHERE kind = ? AND tag = 'a' AND value = ? AND pubkey = ? AND created_at >= ?
          LIMIT 1
        `,
        [Kind.EventDeletion, address, event.pubkey, event.created_at],
      ) as { found: number } | undefined

      if (byAddress?.found) {
        return true
      }
    }

    return false
  }

  private applyDeletionRequest(db: Database, event: NostrEventDB) {
    if (event.kind !== Kind.EventDeletion) {
      return
    }

    for (const tag of event.tags) {
      if (tag[0] === 'e' && tag[1]) {
        db.exec(
          `
            DELETE FROM events
            WHERE id = ? AND pubkey = ? AND created_at <= ? AND kind != ?
          `,
          { bind: [tag[1], event.pubkey, event.created_at, Kind.EventDeletion] },
        )
        continue
      }

      if (tag[0] === 'a' && tag[1]) {
        const parts = tag[1].split(':')
        if (parts.length < 3) {
          continue
        }
        const addressKind = Number(parts[0])
        const addressPubkey = parts[1]
        const dTag = parts.slice(2).join(':')
        if (!Number.isFinite(addressKind) || !dTag || addressPubkey !== event.pubkey) {
          continue
        }

        db.exec(
          `
            DELETE FROM events
            WHERE id IN (
              SELECT e.id
              FROM events e
              INNER JOIN tags t ON t.eventId = e.id
              WHERE
                e.kind = ? AND
                e.pubkey = ? AND
                e.created_at <= ? AND
                t.tag = 'd' AND
                t.value = ?
            )
            AND kind != ?
          `,
          { bind: [addressKind, addressPubkey, event.created_at, dTag, Kind.EventDeletion] },
        )
      }
    }
  }

  insertEvent(db: Database, event: NostrEventDB) {
    const expiration = event.tags.find((tag) => tag[0] === 'expiration')?.[1]
    if (expiration) {
      const expirationSec = Number(expiration)
      const nowSec = Math.floor(Date.now() / 1000)
      if (Number.isFinite(expirationSec) && expirationSec <= nowSec) {
        return
      }
    }

    if (event.kind !== Kind.EventDeletion && this.hasDeleteRequestForEvent(db, event)) {
      return
    }

    if (isReplaceableKind(event.kind)) {
      const found = this.getReplaceable(db, event.kind, event.pubkey)
      if (found) {
        if (found.created_at < event.created_at) {
          this.delete(db, found.id)
        } else {
          return
        }
      }
    }

    if (isAddressableKind(event.kind)) {
      const dTag = getDTag(event)
      if (!dTag) {
        return false
      }

      const found = this.getAddressable(db, event.kind, event.pubkey, dTag)
      if (found) {
        if (found.created_at < event.created_at) {
          this.delete(db, found.id)
        } else {
          return
        }
      }
    }

    db.exec(
      `INSERT OR IGNORE INTO events (id, kind, pubkey, created_at, content, sig, tags, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        bind: [
          event.id,
          event.kind,
          event.pubkey,
          event.created_at,
          event.content,
          event.sig,
          JSON.stringify(event.tags),
          JSON.stringify(event.metadata),
        ],
      },
    )
    for (const tag of event.tags) {
      if (tag.length >= 2 && (tag[0].length === 1 || tag[0] === 'expiration')) {
        db.exec(
          `INSERT OR IGNORE INTO tags (eventId, tag, value, kind, pubkey, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
          { bind: [event.id, tag[0], tag[1], event.kind, event.pubkey, event.created_at] },
        )
      }
    }

    if (event.kind === Kind.EventDeletion) {
      this.applyDeletionRequest(db, event)
    }

    return event
  }

  delete(db: Database, id: string) {
    db.exec(`DELETE FROM events WHERE id = ?`, { bind: [id] })
  }
}
