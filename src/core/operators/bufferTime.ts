import type { OperatorFunction } from 'rxjs'
import { filter, pipe, bufferTime as rxBufferTime } from 'rxjs'

export function bufferTime<T>(bufferTimeSpan: number): OperatorFunction<T, T[]> {
  return pipe(
    rxBufferTime(bufferTimeSpan),
    filter((events) => events.length > 0),
  )
}
