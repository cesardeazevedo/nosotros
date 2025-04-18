import { getSnapshot } from 'mobx-state-tree'
import { identity } from 'observable-hooks'
import { distinct, EMPTY, mergeMap, switchMap } from 'rxjs'
import type { Deck } from '../deck/deck.store'
import { toStream } from '../helpers/toStream'
import { subscribeModule } from './subscribeModule'

export function subscribeDeckColums(deck: Deck) {
  return toStream(() => [...deck.modules.modules.keys()]).pipe(
    mergeMap(identity),
    distinct(),
    mergeMap((id) => {
      return toStream(() => deck.modules.modules.get(id)).pipe(
        switchMap((module) => {
          if (!module) return EMPTY
          return toStream(() => ({ module, ...getSnapshot(module) })).pipe(
            switchMap(({ module }) => subscribeModule(module)),
          )
        }),
      )
    }),
  )
}
