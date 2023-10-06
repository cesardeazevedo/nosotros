import { Event } from 'nostr-tools'
import {
  BehaviorSubject,
  OperatorFunction,
  filter,
  first,
  map,
  mergeMap,
  pipe,
  bufferTime as rxBufferTime,
  share,
  tap,
} from 'rxjs'
import { PostStore } from 'stores/modules/post.store'
import { RootStore } from 'stores/root.store'
import { groupByKey } from 'utils/utils'
import { Subscription, SubscriptionGroup } from './subscription'

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

export function hasValidFilters(): OperatorFunction<Subscription, Subscription> {
  return pipe(
    tap((subscription) => {
      subscription.filters = subscription.filters.filter((filter) => filter.isValid)
    }),
    filter((subscription) => subscription.filters.length > 0),
  )
}

export function bufferPosts(root: RootStore, bufferTimeSpan = 1000): OperatorFunction<Event, PostStore[]> {
  return pipe(
    map((event) => new PostStore(root, event)),
    bufferTime(bufferTimeSpan),
    map((posts) => posts.sort((a, b) => b.event.created_at - a.event.created_at)),
    share(),
  )
}

export function bufferLatestCreatedAt(bufferTimeSpan = 500): OperatorFunction<Event, Event[]> {
  return pipe(
    bufferTime<Event>(bufferTimeSpan),
    map((events) => {
      const data = groupByKey(events, 'pubkey')
      return Object.entries(data).reduce((acc, [pubkey, events]) => {
        return {
          ...acc,
          [pubkey]: events.reduce((prev, event) => (event.created_at > prev.created_at ? event : prev), events[0]),
        }
      }, {})
    }),
    map((events) => Object.values(events)),
  )
}
