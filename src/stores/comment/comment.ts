import type { CommentMetadata } from '@/nostr/helpers/parseComment'
import { pool } from '@/nostr/pool'
import { encodeSafe } from '@/utils/nip19'
import { computed, makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nip19, type NostrEvent } from 'nostr-tools'
import { modelStore } from '../base/model.store'
import { createEditorStore } from '../editor/editor.store'
import { noteStore } from '../notes/notes.store'
import { repostStore } from '../reposts/reposts.store'
import { seenStore } from '../seen/seen.store'
import type { User } from '../users/user'
import { userStore } from '../users/users.store'
import { commentStore } from './comment.store'
import { Kind } from '@/constants/kinds'
import { Note } from '../notes/note'

const compact = (x: Array<Array<string | undefined>>): string[][] => x.map((y) => y.filter((z): z is string => !!z))

export class Comment {
  isReplying = false
  broadcastOpen = false
  contentOpen = false
  repliesOpen: boolean | null = null

  constructor(
    public event: NostrEvent,
    public metadata: CommentMetadata,
  ) {
    makeAutoObservable(this, {
      event: false,
      metadata: false,
      editor: computed({ keepAlive: true }),
    })
  }

  get id() {
    return this.event.id
  }

  get isRoot() {
    return false
  }

  get pubkey() {
    return this.event.pubkey
  }

  get user() {
    return userStore.get(this.event.pubkey)
  }

  get seenOn() {
    return seenStore.get(this.id) || []
  }

  get root() {
    return modelStore.get(this.metadata.rootId)
  }

  get parent() {
    return modelStore.get(this.metadata.parentId)
  }

  get headRelay() {
    return this.seenOn.filter((x) => !pool.blacklisted.has(x))?.[0]
  }

  get mentionNotes() {
    return this.metadata.mentionedNotes.map((id) => noteStore.get(id)).filter((note) => !!note)
  }

  get nevent() {
    return encodeSafe(() =>
      nip19.neventEncode({
        id: this.id,
        author: this.event.pubkey,
        kind: this.event.kind,
        relays: this.seenOn,
      }),
    )
  }

  get editor() {
    return createEditorStore({
      kind: Kind.Comment,
      parentNote: this,
      onPublish: () => {
        this.toggleReplying(false)
      },
    })
  }

  isFollowing(user?: User) {
    return user?.following?.followsPubkey(this.event.pubkey) || false
  }

  get replies() {
    const data = commentStore.getReplies(this.event.id) || []
    return data.map((id) => commentStore.get(id)).filter((comment): comment is Comment => !!comment)
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
        .sort((a) => (a.isFollowing(user) ? -1 : 1))
        // always put the current user at the top
        .sort((a) => (a.event.pubkey === user?.pubkey ? -1 : 1))
    )
  })

  repliesMuted = computedFn((user?: User) => {
    return this.replies.filter((reply) => {
      const isMutedEvent = user?.mutedNotes?.has(reply.id)
      const isMutedAuthor = user?.mutedAuthors?.has(reply.pubkey)
      return isMutedEvent || isMutedAuthor
    })
  })

  get repliesTotal(): number {
    return this.replies.reduce((total, reply) => total + 1 + reply.repliesTotal, 0)
  }

  get repostTotal() {
    return repostStore.repostsByNote.get(this.id)?.size || 0
  }

  get rootReplyTags() {
    const root = this.root
    if (root instanceof Note && root.isAddressable) {
      return [
        ['A', root.address, root.headRelay],
        ['E', root.id, root.headRelay, root.pubkey],
        ['K', root.event.kind.toString()],
        ['P', root.pubkey, root.user?.headRelay],
      ]
    } else if (root instanceof Note || root instanceof Comment) {
      return [
        ['E', root.id, root.headRelay, root.pubkey],
        ['K', root.event.kind.toString()],
        ['P', root.pubkey, root.user?.headRelay],
      ]
    }
    return []
  }

  get parentReplyTags() {
    return [
      ['e', this.id, this.headRelay, this.pubkey],
      ['k', this.event.kind.toString()],
    ]
  }

  get replyTags(): NostrEvent['tags'] {
    return compact([
      ...this.rootReplyTags,
      ...this.parentReplyTags,
      // normal tags
      ['p', this.event.pubkey, this.user?.headRelay],
    ])
  }

  toggleReplying(open?: boolean) {
    this.isReplying = open ?? !this.isReplying
  }

  toggleBroadcast(open?: boolean) {
    this.broadcastOpen = open ?? !this.broadcastOpen
  }

  toggleContent(open?: boolean) {
    this.contentOpen = open ?? !this.contentOpen
  }
}
