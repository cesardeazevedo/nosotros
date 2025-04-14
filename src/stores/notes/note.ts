import { Kind } from '@/constants/kinds'
import type { IMetaFields } from '@/nostr/helpers/parseImeta'
import { getMimeType } from '@/nostr/helpers/parseImeta'
import type { Metadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { computed, makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import type { NostrEvent } from 'nostr-tools'
import { createEditorStore } from '../editor/editor.store'
import type { Event } from '../events/event'
import { eventStore } from '../events/event.store'
import type { User } from '../users/user'

type ReplyStatus = 'IDLE' | 'LOADING' | 'LOADED'

// removes undefined and empty strings from last items in tags
const compact = (x: Array<Array<string | undefined>>): string[][] => {
  return x
    .filter((x) => x.length > 1)
    .map((y) => {
      const filtered = y.filter((z): z is string => z !== undefined)
      const lastNonEmptyIndex = filtered.findLastIndex((z) => z !== '')
      return filtered.slice(0, lastNonEmptyIndex + 1)
    })
}

const PAGINATION_SIZE = 5

export class Note {
  isReplying = false
  broadcastOpen = false
  contentOpen = false
  repliesOpen: boolean | null = null
  repliesStatus: ReplyStatus = 'IDLE'

  limit = PAGINATION_SIZE

  constructor(
    public event: Event,
    open?: boolean,
  ) {
    makeAutoObservable(this, {
      event: false,
      replies: computed.struct,
      replyTags: computed.struct,
      images: computed.struct,
      headImage: computed.struct,
      editor: computed({ keepAlive: true }),
    })

    if (open) {
      this.toggleReplies(true)
      this.toggleContent(true)
    }
  }

  get metadata() {
    return this.event.event[metadataSymbol] as Metadata
  }

  get eventNote() {
    return this.event.event
  }

  get id() {
    return this.eventNote.id
  }

  get user() {
    return this.event.user
  }

  get isRoot() {
    return this.metadata.isRoot
  }

  get root() {
    return eventStore.get(this.metadata.rootId)
  }

  get parent() {
    return eventStore.get(this.metadata.parentId)
  }

  get totalReplies() {
    return this.replies.length
  }

  get editor() {
    return createEditorStore({
      kind: this.eventNote.kind !== Kind.Text ? Kind.Comment : Kind.Text,
      parentNote: this,
      onPublish: () => {
        this.toggleReplying(false)
      },
    })
  }

  get mentionNotes() {
    return this.metadata.mentionedNotes?.map((id) => eventStore.get(id)?.event).filter((event) => !!event)
  }

  get reactions() {
    return eventStore.getEventsByKindTagValue(Kind.Reaction, 'e', this.id)
  }

  get reactionsGrouped() {
    // reactions grouped by reaction content
    return Object.entries(
      this.reactions.reduce(
        (acc, { event: { content, pubkey } }) => ({
          [content]: [...(acc?.[content] || []), pubkey],
        }),
        {} as Record<string, string[]>,
      ),
    ).sort((a, b) => b[1].length - a[1].length)
  }

  get reposts() {
    return eventStore.getEventsByKindTagValue(Kind.Repost, 'e', this.id)
  }

  get zaps() {
    return eventStore.getEventsByKindTagValue(Kind.ZapReceipt, 'e', this.id)
  }

  get zapAmount() {
    return (
      this.zaps
        .flatMap(({ event }) => event[metadataSymbol].bolt11)
        .reduce((acc, current) => {
          const amount = parseInt(current?.amount?.value || '0')
          return acc + amount
        }, 0) / 1000
    )
  }

  reactionsByPubkey(pubkey: string) {
    return eventStore.getIdsByKindPubkeyTag(Kind.Reaction, pubkey, 'e')
  }

  get replies() {
    return eventStore.getRepliesEvents(this.event) || []
  }

  repliesSorted = computedFn((user?: User) => {
    return (
      this.replies
        // filter out muted authors and notes
        .filter((reply) => {
          const isMutedEvent = user?.mutedNotes?.has(reply.id)
          const isMutedAuthor = user?.mutedAuthors?.has(reply.pubkey)
          return !isMutedEvent && !isMutedAuthor
        })
        .sort((a) => (user?.followsPubkey(a.pubkey) ? -1 : 1))
        // always put the current user at the top
        .sort((a) => (a.pubkey === user?.pubkey ? -1 : 1))
    )
  })

  repliesMuted = computedFn((user?: User) => {
    return this.replies.filter((reply) => {
      const isMutedEvent = user?.mutedNotes?.has(reply.id)
      const isMutedAuthor = user?.mutedAuthors?.has(reply.pubkey)
      return isMutedEvent || isMutedAuthor
    })
  })

  repliesChunk = computedFn((user?: User) => {
    return this.repliesSorted(user).slice(0, this.limit)
  })

  repliesPreview = computedFn((user?: User) => {
    return this.replies.filter((event) => user?.followsPubkey(event.pubkey)).slice(0, 2)
  })

  // Get preview replies from a single user
  getRepliesPreviewUser = computedFn((user?: User, pubkey?: string) => {
    if (pubkey) {
      return this.replies.filter((event) => event.pubkey === pubkey).slice(0, 2)
    }
    return this.repliesPreview(user)
  })

  get replyTags(): NostrEvent['tags'] {
    switch (this.eventNote.kind) {
      case Kind.Text: {
        // NIP-10 reply tags
        if (this.metadata.isRoot) {
          return compact([
            ['e', this.id, this.event.headRelay || '', 'root', this.event.pubkey],
            ['p', this.event.pubkey, this.user?.headRelay || ''],
          ])
        }
        const tags = [
          this.metadata.rootId
            ? ['e', this.metadata.rootId, this.root?.headRelay || '', 'root', this.root?.pubkey]
            : [],
          ['e', this.id, this.event.headRelay || '', 'reply', this.event.pubkey],
          ['p', this.event.pubkey, this.user?.headRelay],
        ]
        return compact(tags)
      }
      default: {
        // NIP-22 comments tags
        const root = this.root
        const tags = [] as NostrEvent['tags']
        if (root) {
          tags.push(
            ...[
              ['E', root.id, root.headRelay || '', root.pubkey],
              ['K', root.event.kind.toString()],
              ['P', root.pubkey, root.user?.headRelay || ''],
            ],
          )
          if (root.isAddressable) {
            tags.unshift(['A', root.address, root.headRelay || '', root.pubkey])
          }
        } else {
          tags.push(
            ...[
              ['E', this.id, this.event.headRelay || '', this.event.pubkey],
              ['K', this.event.event.kind.toString()],
              ['P', this.event.pubkey, this.user?.headRelay || ''],
            ],
          )
        }
        tags.push(
          ...[
            ['e', this.id, this.event.headRelay || '', this.eventNote.pubkey],
            ['k', this.eventNote.kind.toString()],
            ['p', this.event.pubkey],
          ],
        )
        return compact(tags)
      }
    }
  }

  get repliesLeft() {
    return Math.max(0, this.replies.length - this.limit)
  }

  private getRepliesTotal(event: Event): number {
    const replies = eventStore.getRepliesEvents(event)
    return replies.reduce((total, reply) => total + 1 + this.getRepliesTotal(reply), 0)
  }

  get repliesTotal(): number {
    return this.getRepliesTotal(this.event)
  }

  get isLoading() {
    return this.repliesOpen && this.repliesStatus === 'LOADING'
  }

  get isEmpty() {
    return this.repliesStatus === 'LOADED' && this.replies.length === 0
  }

  get hasRepliesLeft() {
    return this.repliesLeft > 0
  }

  get images() {
    return this.metadata.contentSchema?.content.filter((x) => x.type === 'image').map((x) => x.attrs.src)
  }

  get headImage() {
    return this.images?.[0]
  }

  get imetaList() {
    return Object.entries(this.metadata.imeta || {}).map(([src, data]) => {
      const mime = getMimeType(src, data as IMetaFields)
      return [mime, src, data] as const
    })
  }

  setRepliesStatus(state: ReplyStatus) {
    this.repliesStatus = state
  }

  toggleReplying(open?: boolean) {
    this.isReplying = open ?? !this.isReplying
  }

  toggleReplies(open?: boolean | null) {
    this.repliesOpen = open ?? !this.repliesOpen
  }

  toggleBroadcast(open?: boolean) {
    this.broadcastOpen = open ?? !this.broadcastOpen
  }

  toggleContent(open?: boolean) {
    this.contentOpen = open ?? !this.contentOpen
  }

  paginate(offset = PAGINATION_SIZE) {
    this.limit = Math.min(this.replies.length, this.limit + offset)
  }
}
