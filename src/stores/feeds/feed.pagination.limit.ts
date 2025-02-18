import { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import { t } from 'mobx-state-tree'
import { FeedStoreModel } from './feed.store'

export const FeedPaginationLimit = FeedStoreModel.named('FeedPaginationLimit')
  .props({
    limit: t.optional(t.number, 50),
  })
  .volatile((self) => ({
    pagination: new PaginationLimitSubject(self.filter, { limit: self.limit }),
  }))
  .actions((self) => ({
    paginate() {
      self.chunk = Math.max(20, Math.min(self.notes.size + 20, self.chunk + 20))
      if (self.chunk >= self.notes.size) {
        self.pagination.nextUntil(self.until)
      }
    },
  }))
