import { filter, map, pipe } from 'rxjs'
import { hasEventInCache, setCache } from '../cache'

export function distinctEvent() {
  return pipe(
    filter(([, event]) => {
      const found = hasEventInCache(event)
      if (!found) setCache(event, true)
      return !found
    }),
    map((data) => data[1]),
  )
}
