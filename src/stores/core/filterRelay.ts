import { comparer, reaction } from 'mobx'
import { Filter as NostrFilter } from 'nostr-tools'
import type { RootStore } from 'stores/root.store'
import { dedupe, groupKeysToArray, toMap } from 'utils/utils'
import { RelayHintsData } from './relayHints'

export class FilterRelay {
  filter: NostrFilter
  hints: RelayHintsData | undefined

  result: Record<string, NostrFilter>
  pending: NostrFilter | null
  private prevPending: NostrFilter

  constructor(
    private root: RootStore,
    filter: NostrFilter,
    relayHints?: RelayHintsData,
  ) {
    this.filter = { ...filter }
    this.prevPending = { ...filter }
    this.hints = relayHints

    this.pending = null
    this.result = {}
  }

  reset() {
    this.result = {}
  }

  async parse() {
    this.result = {}
    this.pending = null

    await this.parseAuthors(this.prevPending)
    await this.parseIds(this.prevPending)

    this.prevPending = { ...(this.pending || {}) }
  }

  async getRelaysFromAuthors(authors: string[]) {
    return groupKeysToArray(
      await Promise.all(
        authors?.map(async (author) => ({
          [author]: await this.root.userRelays.fetchRelaysFromAuthor(author),
        })),
      ),
    )
  }

  private set(relays: string[], field: 'authors' | 'ids' | '#e', value: string) {
    if (relays.length > 0) {
      relays.forEach((relay) => {
        if (!this.result[relay]) {
          this.result[relay] = { ...this.prevPending, [field]: [] }
        }
        this.result[relay][field]?.push(value)
      })
    } else {
      if (!this.pending) {
        this.pending = { ...this.prevPending, [field]: [] }
      }
      this.pending[field]?.push(value)
    }
  }

  private async parseAuthors(filter: NostrFilter) {
    if (filter.authors) {
      const relaysAuthors = await this.getRelaysFromAuthors(filter.authors)
      for (const author of filter.authors) {
        const relayHints = this.hints?.authors?.[author]
        const relays = dedupe(relaysAuthors[author], relayHints)
        this.set(relays, 'authors', author)
      }
    }
  }

  private async parseIds(filter: NostrFilter) {
    if (filter.ids || filter['#e']) {
      for (const field of ['ids', '#e'] as const) {
        for (const id of filter[field] || []) {
          const relaysHints = this.hints?.ids?.[id] || []
          const author = this.hints?.fallback?.[id]
          const relayAuthors: string[] = []
          if (author) {
            const relays = await this.getRelaysFromAuthors(author)
            relayAuthors.push(...dedupe(Object.values(relays || {})))
          }
          const relays = dedupe(relaysHints, relayAuthors)
          this.set(relays, field, id)
        }
      }
    }
  }
}

export class FilterRelayGroup {
  filters: NostrFilter[]
  filterRelays: FilterRelay[]
  hints?: RelayHintsData

  constructor(
    private root: RootStore,
    filters: NostrFilter[],
    hints?: RelayHintsData,
  ) {
    this.filters = filters
    this.hints = hints
    this.filterRelays = this.filters.map((filter) => new FilterRelay(this.root, filter, hints))
  }

  get pendingAuthors() {
    const pendingAuthors = dedupe(this.filterRelays?.map((filter) => filter.pending?.authors))
    const fallbackAuthors = dedupe(Object.values(this.hints?.fallback || {}))
    return dedupe(pendingAuthors, fallbackAuthors)
  }

  get results() {
    return toMap<NostrFilter[]>(groupKeysToArray(this.filterRelays?.map((filter) => filter.result) || []))
  }

  get pendings() {
    return this.filterRelays?.map((filter) => filter.pending).filter((x) => x) || []
  }

  async prepare() {
    await Promise.all(this.filterRelays.map((filter) => filter.parse()))
  }

  subscribeToPendingRelayList(callback?: () => void) {
    const trackers = () => {
      return this.pendingAuthors.map((author) => [
        this.root.userRelays.relays.get(author),
        this.root.userRelays.relaysNIP05.get(author),
      ])
    }
    const effect = async () => {
      const pendings = this.pendings.slice()
      await this.prepare()
      const newPendings = this.pendings.slice()
      if (!comparer.structural(pendings, newPendings)) {
        callback?.()
      }
    }
    const disposer = reaction(trackers, effect, { delay: 2000 })
    setTimeout(disposer, 10000)
  }
}
