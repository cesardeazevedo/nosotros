import { BehaviorSubject, Observable, Subject, share, tap } from 'rxjs'
import { RootStore } from 'stores/root.store'
import { hasValidFilters, mergeDelayedSubscriptions, switcher } from './operators'
import { Subscription } from './subscription'

export class SubscriptionBatcher {
  private _subject$: Subject<Subscription>

  private _enabled: BehaviorSubject<boolean>

  send$: Observable<Subscription>

  constructor(
    private root: RootStore,
    private bufferTimeSpan = 800,
  ) {
    this._subject$ = new Subject<Subscription>()

    this._enabled = new BehaviorSubject(false)

    this.send$ = this._subject$.pipe(
      // Enable or disable the stream
      switcher(this._enabled),
      // Group subscriptions together by the bufferTime
      mergeDelayedSubscriptions(this.root, this.bufferTimeSpan),
      // Removed authors and ids that are already cached on the store
      tap((subscription) => {
        subscription.filters.forEach((filter) => filter.removeStoredKeys())
      }),
      // Filter out invalid filters
      hasValidFilters(),

      share(),
      // Rate limit?
    )
  }

  resume() {
    this._enabled.next(true)
  }

  pause() {
    this._enabled.next(false)
  }

  send(subscription: Subscription) {
    return this._subject$.next(subscription)
  }
}
