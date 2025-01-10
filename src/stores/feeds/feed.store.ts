import { PaginationSubject } from '@/core/PaginationRangeSubject'
import type { NostrEventMetadata } from '@/nostr/types'
import { Duration } from 'luxon'
import { observable } from 'mobx'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { ignoreElements, interval, map, take, takeWhile, tap } from 'rxjs'
import { NostrSubscriptionModel } from '../base/base.models'

export const FeedStoreModel = NostrSubscriptionModel.named('FeedStoreModel')
  .props({
    range: t.optional(t.number, Duration.fromObject({ hours: 1 }).as('minutes')),
  })
  .volatile((self) => ({
    notes: observable.map<string, NostrEventMetadata>(),
    buffer: observable.map<string, NostrEventMetadata>(),
    latest: observable.map<string, NostrEventMetadata>(),
    published: observable.map<string, NostrEventMetadata>(),
    pagination: new PaginationSubject(self.filter, { range: self.range }),
  }))
  .views((self) => ({
    get list() {
      return [...self.published.values(), ...self.latest.values(), ...self.notes.values()]
    },
  }))
  .actions((self) => ({
    add(item: NostrEventMetadata) {
      self.notes.set(item.id, item)
    },
    addPublish(item: NostrEventMetadata) {
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

export interface FeedStore extends Instance<typeof FeedStoreModel> {}
export interface FeedStoreSnapshotIn extends SnapshotIn<typeof FeedStoreModel> {}
