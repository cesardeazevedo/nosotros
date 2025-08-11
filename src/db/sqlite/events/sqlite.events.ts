import type { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { BindableValue, Database } from '@sqlite.org/sqlite-wasm'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind, isReplaceableKind } from 'nostr-tools/kinds'
import { InsertBatcher } from '../batcher'
import type { NostrEventDB, NostrEventStored } from '../sqlite.types'

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
      sig: '',
      tags: JSON.parse(event.tags || '{}'),
      metadata: JSON.parse(event.metadata || '{}'),
    } as NostrEventDB
  }

  exists(db: Database, event: NostrEvent) {
    if (isReplaceableKind(event.kind)) {
      return this.getReplaceable(db, event.kind, event.pubkey)
    } else if (isParameterizedReplaceableKind(event.kind)) {
      const dTag = event.tags.find((tag) => tag[1] === 'd')?.[1]
      if (dTag) {
        return this.getAddressable(db, event.kind, event.pubkey, dTag)
      }
    }
    return this.getById(db, event.id)
  }

  getById(db: Database, id: string) {
    const query = `SELECT id FROM events WHERE id = ? LIMIT 1`
    return db.selectValue(query, [id]) as NostrEventDB | undefined
  }

  private getReplaceable(db: Database, kind: Kind, pubkey: string) {
    const query = `SELECT id FROM events WHERE kind = ? AND pubkey = ? LIMIT 1`
    return db.selectValue(query, [kind, pubkey]) as NostrEventDB | undefined
  }

  private getAddressable(db: Database, kind: Kind, pubkey: string, dTag: string) {
    const query = `
      SELECT eventId FROM tags
      WHERE
          kind = ? AND
          tag = 'd' AND
          value = ? AND
          pubkey = ?
      LIMIT 1
      `
    return db.selectValue(query, [kind, pubkey, dTag]) as NostrEventDB | undefined
  }

  /**
   * Get raw nostr event with signature and without metadata
   */
  getRawEventById(db: Database, id: string) {
    const query = `SELECT id, kind, pubkey, content, sig, tags FROM events WHERE id = ?`
    const res = db.selectObject(query, [id]) as unknown as NostrEventStored
    return {
      ...res,
      tags: JSON.parse(res.tags),
    }
  }

  getByIds(db: Database, ids: string[]) {
    const query = `
      SELECT * FROM events
      WHERE id IN (${ids.map(() => '?').join(',')})
    `
    const res = db.selectObjects(query, ids) || []
    return res.map((event) => this.formatEvent(event as NostrEventStored))
  }

  query(db: Database, filter: NostrFilter, relays: string[] = []) {
    if (filter.ids && filter.ids.length) {
      return this.getByIds(db, filter.ids)
    }

    const conditions: string[] = []
    const params: BindableValue[] = []

    for (const [key, values] of Object.entries(filter)) {
      if (key.startsWith('#') && Array.isArray(values) && values.length > 0) {
        if (filter.kinds?.length) {
          conditions.push(`tags.kind IN (${filter.kinds.map(() => '?').join(',')})`)
          params.push(...filter.kinds)
        }

        const tagName = key.slice(1)
        const query = `
          SELECT e.*
          FROM tags
          INNER JOIN events e on e.id = tags.eventId
          WHERE
            ${conditions.length ? conditions.join(' AND ') : '1'}
            AND tags.tag = '${tagName}'
            AND tags.value IN (${values.map(() => '?')})
          ORDER BY e.created_at DESC
        `
        params.push(...values)
        const res = db.selectObjects(query, params)
        return res.map((event) => this.formatEvent(event as NostrEventStored))
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

  private insertEvent(db: Database, event: NostrEventDB) {
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

    if (isParameterizedReplaceableKind(event.kind)) {
      const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
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
      if (tag.length >= 2) {
        db.exec(
          `INSERT OR IGNORE INTO tags (eventId, tag, value, kind, pubkey, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
          { bind: [event.id, tag[0], tag[1], event.kind, event.pubkey, event.created_at] },
        )
      }
    }
    return event
  }

  private delete(db: Database, id: string) {
    db.exec(`DELETE FROM events WHERE id = ?`, { bind: [id] })
  }
}
