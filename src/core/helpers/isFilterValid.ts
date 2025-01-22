import type { NostrFilter } from 'core/types'

export function isFilterValid(filter: NostrFilter): boolean {
  const ids = filter.ids?.length || 0
  const search = filter.search?.length || 0
  const authors = filter.authors?.length || 0
  const kinds = filter.kinds?.length || 0
  const tag = Object.keys(filter).find((x) => x.startsWith('#')) as `#${string}` | undefined
  const tagValue = (tag && tag in filter ? filter[tag] || [] : []).length
  return authors > 0 || ids > 0 || search > 0 || (kinds > 0 && (ids > 0 || authors > 0 || tagValue > 0))
}
