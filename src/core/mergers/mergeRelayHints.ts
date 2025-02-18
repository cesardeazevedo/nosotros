import type { RelayHints } from 'core/types'
import { groupKeysFromArray } from '../helpers/groupKeysFromArray'
import { removeEmptyKeys } from '../helpers/removeEmptyKeys'

export function mergeRelayHints(hints: RelayHints[] = []) {
  const authors = groupKeysFromArray(hints.map((x) => x.authors))
  const ids = groupKeysFromArray(hints.map((x) => x.ids))
  const idHints = groupKeysFromArray(hints.map((x) => x.idHints))
  return removeEmptyKeys<RelayHints>({ authors, ids, idHints })
}
