import { matchFilters } from 'nostr-tools'
import type { Observable } from 'rxjs'
import {
  EMPTY,
  Subject,
  catchError,
  combineLatestWith,
  filter,
  firstValueFrom,
  map,
  mergeMap,
  of,
  pipe,
  share,
  tap,
} from 'rxjs'
import type { NostrSubscription, SubscriptionOptions } from './NostrSubscription'
import { mergeSubscriptions } from './mergers/mergeSubscription'
import { bufferTime } from './operators/bufferTime'
import type { NostrEvent } from './types'

type Options = {
  bufferTimeSpan?: number
  outbox?: SubscriptionOptions['outbox']
  subscribe: (sub: NostrSubscription) => Observable<[string, NostrEvent]>
}

export class NostrSubscriptionBatcher {
  private subject = new Subject<NostrSubscription>()
  private subscriptions = new Map<string, Observable<[string, NostrEvent]>>()

  buffer$: Observable<NostrSubscription>

  constructor(options: Options) {
    this.buffer$ = this.subject.pipe(
      bufferTime(options.bufferTimeSpan || 1200),
      map((subs) => (subs.length === 1 ? subs[0] : mergeSubscriptions(subs, options))),
      share(),
    )

    this.buffer$.subscribe((parent) => {
      const events$ = options.subscribe(parent).pipe(share())
      this.subscriptions.set(parent.id, events$)
    })
  }

  subscribe() {
    return pipe(
      // In case of empty filters, complete the stream immediately
      mergeMap((sub: NostrSubscription) => {
        if (sub.filters.length > 0) {
          return of(sub)
        }
        throw new Error('Empty Subscription')
      }),

      tap((sub: NostrSubscription) => this.subject.next(sub)),

      combineLatestWith(firstValueFrom(this.buffer$)),

      mergeMap(([child, parent]) => {
        const events$ = this.subscriptions.get(parent.id)
        if (events$) {
          return events$.pipe(filter(([, event]) => matchFilters(child.filters, event)))
        }
        console.log('Couldnt find parent event stream', parent.id)
        return EMPTY
      }),

      catchError(() => EMPTY),
    )
  }
}
