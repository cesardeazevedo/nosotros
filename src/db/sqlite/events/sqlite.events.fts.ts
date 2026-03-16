import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { BindableValue, Database } from '@sqlite.org/sqlite-wasm'
import { InsertBatcher } from '../batcher'
import type { NostrEventDB, NostrEventStored } from '../sqlite.types'

const SEARCHABLE_KINDS = new Set<number>([Kind.Text, Kind.Media, Kind.Video, Kind.ShortVideo, Kind.Article])

const LINK_REGEX = /\b(?:https?:\/\/|www\.)\S+/gi
const NOSTR_URI_REGEX = /(?<!\w)nostr:(?:note|npub|nprofile|nevent|naddr|nrelay|nsec)1\w+(?!\w)/giu
const NOSTR_BECH32_REGEX = /(?<!\w)(?:note|npub|nprofile|nevent|naddr|nrelay|nsec)1\w+(?!\w)/giu
const WHITESPACE_REGEX = /\s+/g

const SEARCH_TEXT_LIMITS: Partial<Record<number, number>> = {
  [Kind.Text]: 1200,
  [Kind.Media]: 1200,
  [Kind.Video]: 1200,
  [Kind.ShortVideo]: 1200,
  [Kind.Article]: 4000,
}

type SearchableEventInput = {
  kind: number
  content?: string
  tags: string[][]
}

type BuiltQuery = {
  conditions: string[]
  params: BindableValue[]
  needsTagJoin: boolean
  tagName: string
  tagValues: BindableValue[]
}

export class SqliteEventSearch {
  batcher: InsertBatcher<NostrEventDB>

  constructor(private db: Promise<Database>) {
    this.batcher = new InsertBatcher(async (events) => {
      this.indexBatch(await this.db, events)
    })
  }

  index(event: NostrEventDB) {
    this.batcher.next(event)
  }

  indexEvent(db: Database, event: NostrEventDB) {
    const content = buildSearchContent(event)
    db.exec(`DELETE FROM events_fts WHERE eventId = ?`, { bind: [event.id] })
    if (!content) {
      return
    }
    db.exec(
      `
        INSERT INTO events_fts (eventId, content)
        VALUES (?, ?)
      `,
      { bind: [event.id, content] },
    )
  }

  delete(db: Database, eventId: string) {
    db.exec(`DELETE FROM events_fts WHERE eventId = ?`, { bind: [eventId] })
  }

  private indexBatch(db: Database, events: NostrEventDB[]) {
    db.transaction((db) => {
      events.forEach((event) => this.indexEvent(db, event))
    })
  }
}

export function isSearchableEventKind(kind: number) {
  return SEARCHABLE_KINDS.has(kind)
}

export function buildSearchContent(event: SearchableEventInput) {
  if (!isSearchableEventKind(event.kind)) {
    return undefined
  }

  const tags = event.tags
    .filter((tag) => tag[1] && (tag[0] === 't' || tag[0] === 'client'))
    .map((tag) => tag[1].trim())
    .filter(Boolean)

  const parts = [normalizeSearchText(event.content || ''), ...tags.map(normalizeSearchText)].filter(Boolean)
  if (parts.length === 0) {
    return undefined
  }

  const maxLength = SEARCH_TEXT_LIMITS[event.kind] || 1200
  return parts.join(' ').slice(0, maxLength).trim()
}

export function queryEventSearch(
  db: Database,
  filter: NostrFilter,
  relays: string[],
  buildQuery: (filter: NostrFilter, relays: string[], table: string) => BuiltQuery,
  formatEvent: (event: NostrEventStored) => NostrEventDB,
) {
  const match = buildSearchMatchQuery(filter.search || '')
  if (!match) {
    return []
  }

  const { conditions, params, needsTagJoin, tagName, tagValues } = buildQuery(filter, relays, 'e')
  const query = `
    SELECT DISTINCT e.*
    FROM events_fts
    INNER JOIN events e ON e.id = events_fts.eventId
    ${needsTagJoin ? 'INNER JOIN tags ON tags.eventId = e.id' : ''}
    WHERE events_fts MATCH ?
      ${conditions.length ? `AND ${conditions.join(' AND ')}` : ''}
      ${needsTagJoin ? `AND tags.tag = '${tagName}' AND tags.value IN (${tagValues.map(() => '?')})` : ''}
    ORDER BY e.created_at DESC
    ${filter.limit ? 'LIMIT ?' : ''}
  `
  const bind: BindableValue[] = [match, ...params]
  if (needsTagJoin) {
    bind.push(...tagValues)
  }
  if (filter.limit) {
    bind.push(filter.limit)
  }
  const res = db.selectObjects(query, bind) || []
  return res.map((event) => formatEvent(event as NostrEventStored))
}

function buildSearchMatchQuery(query: string) {
  const tokens = normalizeSearchText(query)
    .split(' ')
    .map((token) => sanitizeToken(token.trim()))
    .filter(Boolean)

  if (tokens.length === 0) {
    return undefined
  }

  return tokens.join(' AND ')
}

function normalizeSearchText(value: string) {
  return value
    .replace(LINK_REGEX, ' ')
    .replace(NOSTR_URI_REGEX, ' ')
    .replace(NOSTR_BECH32_REGEX, ' ')
    .replace(WHITESPACE_REGEX, ' ')
    .trim()
}

function sanitizeToken(token: string) {
  return token.replace(/[^\p{L}\p{N}_]/gu, '')
}
