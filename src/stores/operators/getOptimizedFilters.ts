import { Kind } from "constants/kinds"
import { createFilter, isFilterValid } from "core/helpers"
import type { NostrFilter } from "core/types"
import { cacheRelayList } from "nostr/cache"
import { followsStore } from "stores/nostr/follows.store"
import { noteStore } from "stores/nostr/notes.store"
import { userStore } from "stores/nostr/users.store"

export function getOptimizedFilters(filters: NostrFilter | NostrFilter[]) {
  const newFilters: NostrFilter[] = []
  for (const filter of [filters].flat().map(createFilter)) {
    if (filter.authors) {
      switch (filter.kinds?.[0]) {
        case Kind.Metadata: {
          newFilters.push({ ...filter, authors: filter.authors?.filter((author) => !userStore.users.has(author)) })
          break
        }
        case Kind.Follows: {
          newFilters.push({ ...filter, authors: filter.authors?.filter((author) => !followsStore.follows.has(author)) })
          break
        }
        case Kind.RelayList: {
          newFilters.push({ ...filter, authors: filter.authors?.filter((author) => !cacheRelayList.has(author)) })
          break
        }
        default: {
          newFilters.push({ ...filter })
        }
      }
    } else if (filter.ids) {
      newFilters.push({ ...filter, ids: filter.ids.filter((id) => !noteStore.notes.has(id)) })
    } else {
      newFilters.push({ ...filter })
    }
  }
  return newFilters.filter(isFilterValid)
}
