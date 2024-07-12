import { useObservableCallback, useSubscription } from "observable-hooks"
import { distinct, from, mergeMap, range, tap } from "rxjs"
import type { ModuleInterface } from "stores/modules/interface"

export function useRangeChange(feed: ModuleInterface) {
  const [onRangeChange, rangeChange$] = useObservableCallback<number, [number, number]>((event$) => event$.pipe(
    mergeMap(([start, end]) => from(range(start, (end - start)))), // + default overscan is 4
    distinct((x) => x),
  ))

  useSubscription(rangeChange$.pipe(tap((index) => feed.onRangeChange?.(index))))
  return onRangeChange
}
