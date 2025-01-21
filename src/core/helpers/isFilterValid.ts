import type { NostrFilter } from 'core/types'

export function isFilterValid(filter: NostrFilter): boolean {
  const ids = filter.ids?.length || 0
  const search = filter.search?.length || 0
  const authors = filter.authors?.length || 0
  const kinds = filter.kinds?.length || 0
  return authors > 0 || ids > 0 || search > 0 || kinds > 0
}
