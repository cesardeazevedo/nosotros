import type { NostrEventMetadata } from '@/nostr/types'
import { observable } from 'mobx'
import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { NostrSubscriptionModel } from '../base/base.models'

export const FeedStoreModel = NostrSubscriptionModel.named('FeedStoreModel')
  .volatile(() => ({
    notes: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    buffer: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    latest: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    published: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    until: Infinity,
    chunk: 20,
  }))
  .views((self) => ({
    get list() {
      return [...self.published.values(), ...self.latest.values(), ...self.notes.values()].slice(0, self.chunk)
    },
  }))
  .actions((self) => ({
    add(item: NostrEventMetadata) {
      self.until = Math.min(self.until, item.created_at)
      self.notes.set(item.id, item)
    },
    addPublish(item: NostrEventMetadata) {
      self.published.set(item.id, item)
    },
    reset() {
      self.until = Infinity
      self.chunk = 20
      self.notes.clear()
    },
    flush() {
      self.buffer.forEach((value, key) => {
        self.latest.set(key, value)
      })
    },
  }))

export interface FeedStore extends Instance<typeof FeedStoreModel> {}
export interface FeedStoreSnapshotIn extends SnapshotIn<typeof FeedStoreModel> {}
