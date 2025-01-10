import { pool } from '@/nostr/pool'
import type { NoteMetadata } from '@/nostr/types'
import { noteStore } from '@/stores/notes/notes.store'
import { seenStore } from '@/stores/seen/seen.store'
import { userStore } from '@/stores/users/users.store'
import { encodeSafe } from '@/utils/nip19'
import { computed, makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import type { NostrClient } from 'nostr/nostr'
import { createEditorStore } from '../editor/editor.store'
import { repostStore } from '../reposts/reposts.store'
import type { User } from '../users/user'

type ReplyStatus = 'IDLE' | 'LOADING' | 'LOADED'

const PAGINATION_SIZE = 5

export class Note {
  isReplying = false
  broadcastOpen = false
  contentOpen = false
  repliesOpen: boolean | null = null
  repliesStatus: ReplyStatus = 'IDLE'

  limit = PAGINATION_SIZE

  constructor(
    public event: NostrEvent,
    public metadata: NoteMetadata,
  ) {
    makeAutoObservable(this, {
      id: false,
      event: false,
      metadata: false,
      seenOn: computed.struct,
      replies: computed.struct,
      replyTags: computed.struct,
      pow: computed.struct,
      images: computed.struct,
      headImage: computed.struct,
      editor: computed({ keepAlive: true }),
    })
  }

  get id() {
    return this.event.id
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

  get headRelay() {
    return this.seenOn.filter((x) => !pool.blacklisted.has(x))?.[0]
  }

  get root() {
    return noteStore.get(this.metadata.rootNoteId)
  }

  get parent() {
    return noteStore.get(this.metadata.parentNoteId)
  }

  get totalReplies() {
    return this.replies.length
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

  get nprofile() {
    return this.user?.nprofile
  }

  get pow() {
    return this.metadata.tags.nonce?.flat()
  }

  get alt() {
    return this.metadata.tags.alt?.flat()?.[0]
  }

  get editor() {
    return createEditorStore({ parentNote: this })
  }

  isFollowing(user?: User) {
    return user?.following?.followsPubkey(this.event.pubkey) || false
  }

  get replies() {
    const data = noteStore.replies.get(this.id) || []
    return data.map((id) => noteStore.get(id)).filter((note): note is Note => !!note)
  }

  repliesSorted = computedFn((user?: User) => {
    return (
      this.replies
        .sort((a) => (a.isFollowing(user) ? -1 : 1))
        // always put the current user at the top
        .sort((a) => (a.event.pubkey === user?.pubkey ? -1 : 1))
    )
  })

  repliesChunk = computedFn((user?: User) => {
    return this.repliesSorted(user).slice(0, this.limit)
  })

  repliesPreview = computedFn((user?: User) => {
    return this.replies.filter((note) => note.isFollowing(user)).slice(0, 2)
  })

  // Get preview replies from a single user
  getRepliesPreviewUser = computedFn((user?: User, pubkey?: string) => {
    if (pubkey) {
      return this.replies.filter((note) => note.event.pubkey === pubkey).slice(0, 2)
    }
    return this.repliesPreview(user)
  })

  get replyTags(): NostrEvent['tags'] {
    if (this.metadata.isRoot) {
      return [
        ['e', this.id, this.headRelay || '', 'root', this.event.pubkey],
        ['p', this.event.pubkey, this.user?.headRelay].filter((x) => x !== undefined),
      ]
    }
    return [
      ['e', this.metadata.rootNoteId, this.root?.headRelay || '', 'root', this.root?.event.pubkey].filter(
        (x) => x !== undefined,
      ),
      ['e', this.id, this.headRelay || '', 'reply', this.event.pubkey],
      ['p', this.event.pubkey],
    ]
  }

  get repliesLeft() {
    return Math.max(0, this.replies.length - this.limit)
  }

  get repliesTotal(): number {
    return this.replies.reduce((total, reply) => total + 1 + reply.repliesTotal, 0)
  }

  get repostTotal() {
    return repostStore.repostsByNote.get(this.id)?.size || 0
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

  setRepliesStatus(state: ReplyStatus) {
    this.repliesStatus = state
  }

  toggleReplying(open?: boolean) {
    this.isReplying = open ?? !this.isReplying
  }

  toggleReplies(open?: boolean | null) {
    this.repliesOpen = open !== null ? !this.repliesOpen : open
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

  react(client: NostrClient, reaction: string) {
    return client.reactions.publish(this.event, reaction).subscribe()
  }
}
