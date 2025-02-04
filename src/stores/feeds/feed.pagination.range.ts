import { PaginationSubject } from '@/core/PaginationRangeSubject'
import { Duration } from 'luxon'
import { t } from 'mobx-state-tree'
import { ignoreElements, interval, map, take, takeWhile, tap } from 'rxjs'
import { FeedStoreModel } from './feed.store'

export const FeedPaginationRange = FeedStoreModel.named('FeedPaginationRange')
  .props({
    range: t.optional(t.number, Duration.fromObject({ hours: 4 }).as('minutes')),
  })
  .volatile((self) => ({
    pagination: new PaginationSubject(self.filter, { range: self.range }),
  }))
  .actions((self) => ({
    paginateIfEmpty(min = 5) {
      return interval(5000).pipe(
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
    paginate() {
      self.chunk = Math.max(20, Math.min(self.notes.size + 20, self.chunk + 20))
      if (self.chunk >= self.notes.size) {
        self.pagination.next()
      }
    },
  }))
