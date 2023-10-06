import { Kind } from 'constants/kinds'
import { DateTime } from 'luxon'
import { Filter as NostrFilter } from 'nostr-tools'
import type { RootStore } from 'stores/root.store'
import { dedupe, pickBy } from 'utils/utils'
import { RelayHints } from './subscription'

export interface Options {
  pagination: boolean
  range: number
}

const ARRAY_FIELDS = ['kinds', 'authors', 'ids', '#e'] as (keyof NostrFilter)[]

const PAGINATION_RANGE = 60

export class Filter {
  data: NostrFilter
  options: Options

  constructor(
    private root: RootStore,
    data: NostrFilter,
    options?: Partial<Options>,
  ) {
    this.data = Filter.dedupeArrayFields(data)

    this.options = {
      pagination: options?.pagination ?? true,
      range: options?.range || PAGINATION_RANGE,
    }

    if (options?.pagination) {
      this.setInitialPaginationRange()
    }
  }

  static merge(filters: NostrFilter[]): NostrFilter[] {
    const groups: Record<string, NostrFilter> = {}
    filters.forEach((filter) => {
      const mainKey = Object.keys(pickBy(filter, ARRAY_FIELDS))
      const paginationKey = JSON.stringify(pickBy(filter, ['until', 'limit', 'since', 'search']))
      const key = mainKey.toString() + paginationKey + filter.kinds?.length

      if (!groups[key]) {
        groups[key] = { ...filter }
      }
      ARRAY_FIELDS.forEach((filterKey) => {
        const value = filter[filterKey] as string[]
        if (value) {
          ;(groups[key][filterKey] as string[]) = dedupe(groups[key][filterKey] as string[], value)
        }
      })
    })
    return Object.values(groups)
  }

  static dedupeArrayFields(filter: NostrFilter) {
    return Object.entries(filter).reduce((acc: Record<string, unknown>, [key, value]) => {
      if (!ARRAY_FIELDS.includes(key as keyof NostrFilter)) {
        acc[key] = value
        return acc
      }
      if (value && Array.isArray(value) && value.length > 0) {
        acc[key] = dedupe(value as string[]).filter((x) => x !== null && x !== undefined)
      }
      return acc
    }, {}) as NostrFilter
  }

  get isValid() {
    for (const key of ['authors', 'ids', '#e', 'search'] as (keyof Pick<
      NostrFilter,
      'authors' | 'ids' | '#e' | 'search'
    >)[]) {
      const value = this.data[key]
      if (value && value.length > 0) {
        return true
      }
    }
    return false
  }

  setInitialPaginationRange() {
    this.data.since = DateTime.now().minus({ minutes: this.options.range }).toUnixInteger()
    this.data.until = DateTime.now().minus({ minutes: 0 }).toUnixInteger()
  }

  addAuthors(authors: string[]) {
    this.data.authors = dedupe(this.data.authors, authors)
  }

  nextPage(range?: number) {
    if (this.data.since && this.data.until) {
      const minutes = range || this.options.range
      this.data.since = DateTime.fromSeconds(this.data.since).minus({ minutes }).toUnixInteger()
      // handle custom range
      this.data.until = DateTime.fromSeconds(this.data.since)
        .plus({ minutes: range ? minutes : this.options.range })
        .toUnixInteger()
    }
  }

  containsKind(kind: Kind) {
    return this.data.kinds?.includes(kind)
  }

  /**
   * We certainly want to remove any author/ids keys that we already have seen.
   */
  removeStoredKeys() {
    if (this.containsKind(Kind.Metadata) && this.data.authors) {
      this.data.authors = this.data.authors?.filter((author) => !this.root.users.ids.has(author))
    } else if (this.containsKind(Kind.Text) && this.data.ids) {
      this.data.ids = this.data.ids?.filter((id) => !this.root.notes.ids.has(id))
    }
  }

  static async groupAuthorsByRelay(data: NostrFilter, root: RootStore, relayHintsData: RelayHints = {}) {
    if (data.authors) {
      const result: Record<string, NostrFilter> = {}
      const pending: NostrFilter = { ...data, authors: [] }
      for (const author of data.authors) {
        const relaysAuthors = await root.userRelays.getRelaysFromAuthor(author)
        const relayHints = relayHintsData.authors?.[author] || []
        const relays = dedupe(relaysAuthors, relayHints)

        if (relays.length > 0) {
          relays.forEach((relay) => {
            if (!result[relay]) {
              result[relay] = { ...data, authors: [] }
            }
            result[relay].authors?.push(author)
          })
        } else {
          pending.authors?.push(author)
        }
      }
      return { result, pending }
    } else if (data.ids) {
      const result: Record<string, NostrFilter> = {}
      data.ids.forEach((id) => {
        const relays = relayHintsData.ids?.[id] || []
        if (relays.length > 0) {
          relays.forEach((relay) => {
            if (!result[relay]) {
              result[relay] = { ...data, ids: [] }
            }
            result[relay].ids?.push(id)
          })
        }
      })
      return { result, pending: {} }
    }
    return { result: {}, pending: {} }
  }
}
