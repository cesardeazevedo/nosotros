import { PaginationSubject } from '@/core/PaginationRangeSubject'
import { Duration } from 'luxon'
import { observable } from 'mobx'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { ignoreElements, interval, map, take, takeWhile, tap } from 'rxjs'
import { NostrSubscriptionModel } from '../base/base.models'

type ItemAbstract = {
  id: string
}

export function createFeedStore<T extends ItemAbstract>() {
  return NostrSubscriptionModel.named('FeedStoreModel')
    .props({
      range: t.optional(t.number, Duration.fromObject({ hours: 1 }).as('minutes')),
    })
    .volatile((self) => ({
      notes: observable.map<string, T>(),
      buffer: observable.map<string, T>(),
      latest: observable.map<string, T>(),
      published: observable.map<string, T>(),
      pagination: new PaginationSubject(self.filter, { range: self.range }),
    }))
    .views((self) => ({
      get list() {
        return [...self.published.values(), ...self.latest.values(), ...self.notes.values()]
      },
    }))
    .actions((self) => ({
      add(item: T) {
        self.notes.set(item.id, item)
      },
      addPublish(item: T) {
        self.published.set(item.id, item)
      },
      reset() {
        self.notes.clear()
      },
      flush() {
        self.buffer.forEach((value, key) => {
          self.latest.set(key, value)
        })
      },
      paginate() {
        self.pagination.next()
      },
      paginateIfEmpty(min = 5) {
        return interval(2500).pipe(
          map(() => self.notes.size),
          takeWhile((size) => size < min),
          take(10),
          tap(() => {
            self.pagination.increaseRange()
            self.pagination.next()
          }),
          ignoreElements(),
        )
      },
    }))
}

export const UnknownFeedModel = createFeedStore<ItemAbstract>()

export interface UnknownFeed extends Instance<typeof UnknownFeedModel> {}
