import { dedupe } from '@/core/helpers/dedupe'
import { PaginationSubject } from '@/core/PaginationSubject'
import type { NostrEventMetadata } from '@/nostr/types'
import { observable } from 'mobx'
import { getSnapshot, t, type Instance } from 'mobx-state-tree'
import { createEditorStore } from '../editor/editor.store'
import { withToggleAction } from '../helpers/withToggleAction'
import { NostrStoreModel } from '../nostr/nostr.model'

export const FeedScope = t.enumeration('FeedScope', [
  'self',
  'following',
  'followset',
  'followers',
  'relayfeed',
  'inbox',
  'network',
  'global',
  'wot',
])

export const FeedOptions = t.optional(
  t
    .model({
      includeRoot: t.optional(t.boolean, true),
      includeMuted: t.optional(t.boolean, false),
      includeParents: t.optional(t.boolean, false),
      includeReplies: t.optional(t.boolean, true),
      includeMentions: t.optional(t.boolean, true),
    })
    .actions(withToggleAction),
  {
    includeRoot: true,
    includeMuted: true,
    includeReplies: false,
    includeParents: false,
    includeMentions: true,
  },
)

export const FeedPagination = t.frozen({
  range: t.maybe(t.number),
  limit: t.maybe(t.number),
})

const MAX_CHUNK = 20

export const FeedStoreModel = NostrStoreModel.named('FeedStoreModel')
  .props({
    scope: FeedScope,
    options: FeedOptions,
    range: t.maybe(t.number),
  })
  .volatile((self) => ({
    notes: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    buffer: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    latest: observable.array<NostrEventMetadata>([], { deep: false }),
    published: observable.map<string, NostrEventMetadata>({}, { deep: false }),
    pagination: new PaginationSubject(self.filter, { range: self.range }),
    paginationLive: new PaginationSubject({ ...self.filter, since: Math.floor(Date.now() / 1000), limit: 100 }),
    chunk: 20,
  }))
  .views((self) => ({
    get list() {
      const { chunk } = self
      return [...self.published.values(), ...self.latest.values(), ...self.notes.values()].slice(0, chunk)
    },
    get bufferPubkeys() {
      return dedupe([...self.buffer.values()].map((x) => x.pubkey))
    },
    get snapshot() {
      const { blured, ...rest } = self
      return getSnapshot(rest.context)
    },
    unseen(date: number) {
      if (date) {
        return [...self.notes.values()].filter((x) => x.created_at > date)
      }
      return []
    },
  }))
  .actions((self) => ({
    add(item: NostrEventMetadata) {
      self.pagination.until = Math.min(self.pagination.until, item.created_at)
      self.notes.set(item.id, item)
    },
    addPublish(item: NostrEventMetadata) {
      self.published.set(item.id, item)
    },
    addBuffer(item: NostrEventMetadata) {
      self.buffer.set(item.id, item)
    },
    reset() {
      self.notes.clear()
      self.latest.clear()
      self.buffer.clear()
    },
    flush() {
      self.latest.unshift(...self.buffer.values())
      self.buffer.clear()
    },
    paginate() {
      self.chunk = Math.max(MAX_CHUNK, Math.min(self.notes.size + MAX_CHUNK, self.chunk + MAX_CHUNK))
      if (self.chunk >= self.notes.size) {
        self.pagination.paginate()
      }
    },
  }))
  .volatile((self) => ({
    editor: createEditorStore({ onPublish: self.addPublish }),
  }))

export interface FeedStore extends Instance<typeof FeedStoreModel> {}
