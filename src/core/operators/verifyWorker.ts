import type { NostrEvent } from 'nostr-tools'
import { filter, fromEvent, map, mergeMap, pipe, take, takeUntil, tap } from 'rxjs'

const worker = new Worker(new URL('../workers/verify.worker.ts', import.meta.url), { type: 'module' })

const workerMessage = fromEvent<boolean>(worker, 'message').pipe(takeUntil(fromEvent(worker, 'error')))

export function verifyWorker() {
  return pipe(
    tap((event: NostrEvent) => {
      worker.postMessage(event)
    }),
    mergeMap((event: NostrEvent) => {
      return workerMessage.pipe(
        filter((verified) => verified),
        take(1),
        map(() => event),
      )
    }),
  )
}
