import { groupKeysFromArray, removeEmptyKeys } from "core/helpers"
import type { RelayHints } from "core/types"

export function mergeRelayHints(hints: RelayHints[] = []) {
  const authors = groupKeysFromArray(hints.map((x) => x.authors))
  const ids = groupKeysFromArray(hints.map((x) => x.ids))
  const fallback = groupKeysFromArray(hints.map((x) => x.fallback))
  return removeEmptyKeys<RelayHints>({ authors, ids, fallback })
}
