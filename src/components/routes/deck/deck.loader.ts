import { rootStore } from '@/stores/root.store'
import { from, merge, mergeMap } from 'rxjs'

export function deckLoader() {
  const list = rootStore.decks.selected.list
  from(list)
    .pipe(mergeMap((module) => merge(module.subscribe(module.context?.client || rootStore.rootContext.client))))
    .subscribe()
}
