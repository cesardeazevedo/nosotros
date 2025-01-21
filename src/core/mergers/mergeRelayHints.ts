import type { RelayHints } from 'core/types'
import { groupKeysFromArray } from '../helpers/groupKeysFromArray'
import { removeEmptyKeys } from '../helpers/removeEmptyKeys'

export function mergeRelayHints(hints: RelayHints[] = []) {
  const authors = groupKeysFromArray(hints.map((x) => x.authors))
  const ids = groupKeysFromArray(hints.map((x) => x.ids))
  const fallback = groupKeysFromArray(hints.map((x) => x.fallback))
  return removeEmptyKeys<RelayHints>({ authors, ids, fallback })
}
