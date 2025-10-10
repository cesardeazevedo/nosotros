import type { OperatorFunction } from 'rxjs'
import { debounceTime, groupBy, mergeMap, pipe, toArray } from 'rxjs'

export function bufferDebounce<T>(dueTime: number): OperatorFunction<T, T[]> {
  return pipe(
    groupBy(() => '', {
      duration: (group) => group.pipe(debounceTime(dueTime)),
    }),
    mergeMap((group) => group.pipe(toArray())),
  )
}
