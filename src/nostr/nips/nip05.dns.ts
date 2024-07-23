import { bufferTime } from 'core/operators/bufferTime'
import type { UserRelayDB } from 'db/types'
import { LRUCache } from 'lru-cache'
import type { NostrClient } from 'nostr/nostr'
import { storage } from 'nostr/storage'
import type { UserDB } from 'nostr/types'
import { EMPTY, Subject, catchError, concatMap, filter, from, mergeMap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'

export type NIP05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

export class NIP05Dns {
  blacklist: LRUCache<string, boolean>
  queueNIP05: Subject<string>

  constructor(private client: NostrClient) {
    this.blacklist = new LRUCache<string, boolean>({
      ttl: 1000 * 60 * 10,
      ttlAutopurge: true,
    })

    this.queueNIP05 = new Subject<string>()

    this.queueNIP05
      .pipe(
        bufferTime(3000),
        mergeMap((urls) => from(urls)),
        filter((url) => !this.blacklist.has(url)),
        concatMap((url) => this.fetch(url)),
      )
      .subscribe((res) => {
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
  }

  fetch(url: string) {
    const req$ = fromFetch<NIP05Response>(`https://${url}/.well-known/nostr.json`, { selector: (res) => res.json() })
    return req$.pipe(
      catchError(() => {
        this.blacklist.set(url, true)
        return EMPTY
      }),
    )
  }

  enqueue(event: UserDB) {
    if (this.client.settings.nip05enabled) {
      const nip05 = event.metadata.nip05
      if (nip05 && typeof nip05 !== 'undefined') {
        const [, url] = nip05.toLowerCase().split('@')
        this.queueNIP05.next(url)
      }
    }
  }
}
