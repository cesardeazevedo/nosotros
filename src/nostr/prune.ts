import type { Kind } from '@/constants/kinds'
import { isReplaceable } from '@/core/helpers'
import type { NostrFilter } from '@/core/types'
import { cache, cacheReplaceablePrune } from './cache'

export const pruneIds = (ids: string[] = []) => ids.filter((id) => !cache.has(id))
export const pruneReplaceable = (kind: Kind, authors: string[] = []) =>
  authors.filter((author) => !cacheReplaceablePrune.has(`${kind}:${author}`))

export const pruneFilters = (filters: NostrFilter[]) => {
  const newFilters = []
  for (const filter of filters) {
    if (filter.ids) {
      newFilters.push({ ...filter, ids: pruneIds(filter.ids) })
    } else if (filter.authors) {
      const kind = filter.kinds?.[0] as Kind
      if (kind !== undefined && isReplaceable(kind)) {
        newFilters.push({ ...filter, authors: pruneReplaceable(kind, filter.authors) })
      } else {
        newFilters.push(filter)
      }
    } else {
      newFilters.push(filter)
    }
  }
  return newFilters
}
