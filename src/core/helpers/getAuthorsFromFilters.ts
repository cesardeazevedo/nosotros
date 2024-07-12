import type { NostrFilter } from "core/types"
import { dedupe } from "./dedupe"

export function getAuthorsFromFilters(filters: NostrFilter | NostrFilter[]) {
  return [filters].flat().flatMap((filter) => dedupe(filter.authors, filter['#p']))
}
