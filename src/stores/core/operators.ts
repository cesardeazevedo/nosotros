import type { Event } from 'nostr-tools'
import {
  filter,
  first,
  from,
  map,
  mergeAll,
  mergeMap,
  pipe,
  bufferTime as rxBufferTime,
  tap,
  type BehaviorSubject,
  type Observable,
  type OperatorFunction,
} from 'rxjs'

import type { RootStore } from 'stores/root.store'
import { SubscriptionGroup, type Subscription } from './subscription'

export function bufferTime<T>(bufferTimeSpan: number): OperatorFunction<T, T[]> {
  return pipe(
    rxBufferTime(bufferTimeSpan),
    filter((events) => events.length > 0),
  )
}

/**
 * Mostly from https://github.com/redux-observable/redux-observable/blob/master/src/operators.ts
 */
export function ofKind<
  // All possible actions your app can dispatch
  Input extends Event,
  // The types you want to filter for
  Kind extends Input['kind'],
  // The resulting actions that match the above types
  Output extends Input = Extract<Input, Kind>,
>(...kinds: [Kind, ...Kind[]]): OperatorFunction<Input, Output> {
  const len = kinds.length

  return filter(
    len === 1
      ? (event): event is Output => event.kind === kinds[0]
      : (event): event is Output => {
          for (let i = 0; i < len; i++) {
            if (event.kind === kinds[i]) {
              return true
            }
          }

          return false
        },
  )
}

/**
 * Pause / resume a observable stream depending on the value of a subject
 */
export function switcher<T>(subject: BehaviorSubject<boolean>): OperatorFunction<T, T> {
  return pipe(
    mergeMap((value) =>
      subject.pipe(
        filter((value) => value === true),
        first(),
        mergeMap(() => [value]),
      ),
    ),
  )
}

/**
 * Merge delayed subscriptions into SubscriptionGroup
 * @param delayTime number
 * @returns OperatorFunction
 */
export function mergeDelayedSubscriptions(
  root: RootStore,
  bufferTimeSpan: number,
): OperatorFunction<Subscription, Subscription> {
  return pipe(
    bufferTime(bufferTimeSpan),
    map((subscriptions) => {
      return subscriptions.length > 1 ? new SubscriptionGroup(root, subscriptions) : subscriptions[0]
    }),
  )
}

export function mergeStream<T>(streams: (value: T) => Observable<T>): OperatorFunction<T, T> {
  return mergeMap((x) => from([[x], streams(x)]).pipe(mergeAll()))
}

export function hasValidFilters(): OperatorFunction<Subscription, Subscription> {
  return pipe(
    tap((subscription) => {
      subscription.filters = subscription.filters.filter((filter) => filter.isValid)
    }),
    filter((subscription) => subscription.filters.length > 0),
  )
}
