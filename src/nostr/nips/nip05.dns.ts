import { bufferTime } from "core/operators/bufferTime"
import type { UserRelayDB } from "db/types"
import { LRUCache } from "lru-cache"
import { storage } from "nostr/storage"
import type { UserDB } from "nostr/types"
import { NEVER, Subject, catchError, concatMap, filter, from, mergeMap } from "rxjs"
import { fromFetch } from "rxjs/fetch"

export type NIP05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

const blacklist = new LRUCache<string, boolean>({
  ttl: 1000 * 60 * 10,
  ttlAutopurge: true,
})

const queueNIP05 = new Subject<string>()

queueNIP05.pipe(
  bufferTime(3000),
  mergeMap((urls) => from(urls)),
  filter((url) => !blacklist.has(url)),
  concatMap((url) => fetchServer(url)),
).subscribe((res) => {
  const { relays } = res
  // TODO: Handle names
  if (relays) {
    const userRelays = Object.entries(relays).flatMap(([pubkey, relays]) => {
      return relays.map((relay) => ({ type: 'nip05', pubkey, relay }) as UserRelayDB)
    })
    //insertUserRelay(res., userRelays)
    storage.insertUserRelayBulk(userRelays)
  }
})

export function enqueueNIP05(event: UserDB) {
  const nip05 = event.metadata.nip05
  if (nip05 && typeof nip05 !== 'undefined') {
    const [, url] = nip05.toLowerCase().split('@')
    queueNIP05.next(url)
  }
}

export function fetchServer(url: string) {
  const req$ = fromFetch<NIP05Response>(`https://${url}/.well-known/nostr.json`, { selector: (res) => res.json() })
  return req$.pipe(
    catchError(() => {
      blacklist.set(url, true)
      return NEVER
    })
  )
}
