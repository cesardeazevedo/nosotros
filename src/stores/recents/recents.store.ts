import { cast, t } from 'mobx-state-tree'

type RecentType = 'profile' | 'relay'

export const RecentsModel = t
  .model('RecentsModel', {
    list: t.array(
      t.model({
        id: t.string,
        type: t.enumeration<RecentType>('RecentType', ['profile', 'relay']),
      }),
    ),
  })
  .actions((self) => ({
    add(id: string, type: RecentType) {
      this.remove(id)
      self.list.unshift({ id, type })
      self.list = cast(self.list.slice(0, 15))
    },
    remove(id: string) {
      self.list = cast(self.list.filter((x) => x.id !== id))
    },
  }))
