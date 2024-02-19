import { Kind } from 'constants/kinds'
import { DateTime } from 'luxon'
import type { Filter as NostrFilter } from 'nostr-tools'
import type { RootStore } from 'stores/root.store'
import { dedupe, pickBy } from 'utils/utils'

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
    for (const filter of filters) {
      const mainKey = Object.keys(pickBy(filter, ARRAY_FIELDS))
      const paginationKeys = JSON.stringify(pickBy(filter, ['until', 'limit', 'since', 'search']))
      const key = mainKey.toString() + paginationKeys + [...(filter.kinds || [])].sort().toString()

      if (!groups[key]) {
        groups[key] = { ...filter }
      }
      for (const filterKey of ARRAY_FIELDS) {
        const value = filter[filterKey] as string[]
        if (value) {
          ;(groups[key][filterKey] as string[]) = dedupe(groups[key][filterKey] as string[], value)
        }
      }
    }
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
    const ids = this.data.ids?.length || 0
    const ref = this.data['#e']?.length || 0
    const search = this.data.search?.length || 0
    const authors = this.data.authors?.length || 0
    return authors > 0 || ids > 0 || ref > 0 || search > 0
  }

  setInitialPaginationRange(range?: number) {
    if (range) {
      this.options.range = Math.min(range, 14400) // max of 10 days pagination range
    }
    this.data.since = DateTime.now().minus({ minutes: this.options.range }).toUnixInteger()
    this.data.until = DateTime.now().minus({ minutes: 0 }).toUnixInteger()
  }

  addAuthors(authors: string[]) {
    this.data.authors = dedupe(this.data.authors, authors)
  }

  nextPage(range?: number) {
    if (range) {
      this.options.range = Math.min(range, 14400) // max of 10 days pagination range
    }
    if (this.data.since && this.data.until) {
      const { range: minutes } = this.options
      this.data.since = DateTime.fromSeconds(this.data.since).minus({ minutes }).toUnixInteger()
      this.data.until = DateTime.fromSeconds(this.data.since).plus({ minutes: this.options.range }).toUnixInteger()
    }
  }

  containsKind(kind: Kind) {
    return this.data.kinds?.includes(kind)
  }

  /**
   * We certainly want to remove any author/ids keys that we already have seen.
   */
  removeStoredKeys() {
    if (this.containsKind(Kind.Metadata) && !this.containsKind(Kind.Text) && this.data.authors) {
      this.data.authors = this.data.authors?.filter((author) => !this.root.users.users.cachedKeys.has(author))
    } else if (this.data.ids) {
      this.data.ids = this.data.ids?.filter((id) => !this.root.notes.notes.cachedKeys.has(id))
    }
  }
}
