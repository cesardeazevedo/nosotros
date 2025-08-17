import type { NostrSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import type { NostrEvent } from 'nostr-tools'
import { filter, from, fromEvent, map, mergeMap, of, shareReplay, take, takeUntil } from 'rxjs'

const workers = [
  new Worker(new URL('../workers/verify.worker.ts', import.meta.url), { type: 'module' }),
  new Worker(new URL('../workers/verify.worker.ts', import.meta.url), { type: 'module' }),
  new Worker(new URL('../workers/verify.worker.ts', import.meta.url), { type: 'module' }),
  new Worker(new URL('../workers/verify.worker.ts', import.meta.url), { type: 'module' }),
  new Worker(new URL('../workers/verify.worker.ts', import.meta.url), { type: 'module' }),
]

const workerMessage = from(workers).pipe(
  mergeMap((worker) => fromEvent<MessageEvent<boolean>>(worker, 'message').pipe(takeUntil(fromEvent(worker, 'error')))),
  shareReplay(1),
)

let counter = 0
const getWorker = () => workers[counter++ % workers.length]

const cache = new Set<string>()

export function verifyWorker(sub: NostrSubscriptionBuilder) {
  return mergeMap((event: NostrEvent) => {
    if (!cache.has(event.id) && !sub.events.has(event.id)) {
      cache.add(event.id)
      getWorker().postMessage(event)
      return workerMessage.pipe(
        filter((event) => event.data),
        take(1),
        map(() => event),
      )
    }
    return of(event)
  })
}
