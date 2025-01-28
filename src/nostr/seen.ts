import { Kind } from '@/constants/kinds'
import { bufferTime } from '@/core/operators/bufferTime'
import type { SeenDB } from '@/db/types'
import { seenStore } from '@/stores/seen/seen.store'
import type { NostrEvent } from 'nostr-tools'
import { identity, mergeMap, Subject } from 'rxjs'
import { db } from './db'

const kinds = [Kind.Text, Kind.Comment, Kind.Article, Kind.Media, Kind.Highlight]

export class Seen {
  private insert$ = new Subject<SeenDB>()
  private query$ = new Subject<NostrEvent>()

  constructor() {
    this.insert$.pipe(bufferTime(5000)).subscribe((data) => db.seen.insertBulk(data))
    this.query$
      .pipe(
        bufferTime(500),
        mergeMap(identity),
        mergeMap((event) => db.seen.query(event.id)),
        mergeMap(identity),
      )
      .subscribe((seen) => seenStore.add(seen))
  }

  insert(relay: string, event: NostrEvent) {
    if (kinds.includes(event.kind)) {
      const data = { relay, kind: event.kind, eventId: event.id } as SeenDB
      seenStore.add(data)
      this.insert$.next(data)
    }
  }

  query(event: NostrEvent) {
    if (kinds.includes(event.kind)) {
      this.query$.next(event)
    }
  }
}
