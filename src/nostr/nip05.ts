import { nip05store } from '@/stores/nip05/nip05.store'
import { bufferTime } from 'core/operators/bufferTime'
import type { NostrClient } from 'nostr/nostr'
import { EMPTY, Subject, catchError, concatMap, distinct, filter, from, identity, map, mergeMap, tap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { db } from './db'

type NIP05Response = {
  names?: Record<string, string>
  relays?: Record<string, string[]>
}

export class Nip05 {
  blacklist: Map<string, boolean>
  queueNIP05: Subject<string>

  constructor(private client: NostrClient) {
    this.blacklist = new Map<string, boolean>()

    this.queueNIP05 = new Subject<string>()

    this.queueNIP05
      .pipe(
        bufferTime(5000),
        mergeMap(identity),
        distinct(),
        filter((url) => !this.blacklist.has(url)),
        mergeMap((nip05) => this.get(nip05)),
        concatMap((nip05) => {
          const [handle, url] = nip05.toLowerCase().split('@')
          return this.fetch(url, handle).pipe(
            map((response) => [handle, url, response] as const),
            catchError(() => {
              this.blacklist.set(nip05, true)
              return EMPTY
            }),
          )
        }),
        mergeMap(([handle, url, response]) => {
          const pubkey = response.names?.[handle]
          if (!pubkey) {
            return EMPTY
          }
          return from(
            db.nip05.insert({
              pubkey,
              nip05: handle + '@' + url,
              relays: response.relays?.[pubkey] || [],
              timestamp: Date.now() + 86400 * 1000,
            }),
          )
        }),
        tap((data) => nip05store.add(data)),
      )
      .subscribe()
  }

  get(nip05?: string) {
    if (!nip05) return EMPTY
    return from(db.nip05.query(nip05)).pipe(
      // mobx stuff shouldn't really live here
      tap((data) => {
        if (data) {
          nip05store.add(data)
        }
      }),
      filter((res) => Date.now() > (res?.timestamp || 0)),
      map(() => nip05),
    )
  }

  fetch(url: string, name: string) {
    return fromFetch<NIP05Response>(`https://${url}/.well-known/nostr.json?name=${name}`, {
      selector: (res) => res.json(),
      mode: 'cors',
      credentials: 'omit',
    })
  }

  enqueue(nip05: string | undefined) {
    if (this.client.settings.nip05) {
      if (nip05 && typeof nip05 !== 'undefined') {
        this.queueNIP05.next(nip05)
      }
    }
  }
}
