import type { Kind } from 'constants/kinds'
import type { NostrEvent } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { filter } from 'rxjs'

export function ofKind<T extends NostrEvent>(kinds: Kind[]): OperatorFunction<NostrEvent, T> {
  return filter((event): event is T => {
    for (let i = 0; i < kinds.length; i++) {
      if (event.kind === kinds[i]) {
        return true
      }
    }
    return false
  })
}
