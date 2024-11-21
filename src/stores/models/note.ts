import { pool } from '@/nostr/pool'
import { computed, makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import type { NostrClient } from 'nostr/nostr'
import type { NoteMetadataDB, ZapMetadataDB } from 'nostr/types'
import type { Observable } from 'rxjs'
import { EMPTY, filter, finalize, merge, mergeMap, take } from 'rxjs'
import { toast } from 'sonner'
import { noteStore } from 'stores/nostr/notes.store'
import { seenStore } from 'stores/nostr/seen.store'
import { userStore } from 'stores/nostr/users.store'
import { repostStore } from '../nostr/reposts.store'
import type { Repost } from './repost'
import type { User } from './user'

type ReplyStatus = 'IDLE' | 'LOADING' | 'LOADED'

const PAGINATION_SIZE = 5

export class Note {
  isReplying = false
  broadcastOpen = false
  contentOpen = false
  repliesOpen: boolean | null = null
  repliesStatus: ReplyStatus = 'IDLE'

  limit = PAGINATION_SIZE
  offset = 0

  localLastSyncedAt: number | null = null

  constructor(
    public event: NostrEvent,
    public metadata: NoteMetadataDB,
  ) {
    makeAutoObservable(this, {
      id: false,
      event: false,
      meta: false,
      metadata: false,
      seenOn: computed.struct,
      replies: computed.struct,
      replyTags: computed.struct,
      pow: computed.struct,
      images: computed.struct,
      headImage: computed.struct,
    })
  }

  get id() {
    return this.event.id
  }

  get meta() {
    return this.metadata
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
    return noteStore.get(this.meta.rootNoteId)
  }

  get parent() {
    return noteStore.get(this.meta.parentNoteId)
  }

  get totalReplies() {
    return this.replies.length
  }

  get nevent() {
    return nip19.neventEncode({
      id: this.id,
      author: this.event.pubkey,
      kind: this.event.kind,
      relays: this.seenOn,
    })
  }

  get nprofile() {
    return this.user?.nprofile
  }

  get pow() {
    return this.meta.tags.nonce?.flat()
  }

  get alt() {
    return this.meta.tags.alt?.flat()?.[0]
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
    if (this.meta.isRoot) {
      return [
        ['e', this.id, this.headRelay || '', 'root', this.event.pubkey],
        ['p', this.event.pubkey, this.user?.headRelay].filter((x) => x !== undefined),
      ]
    }
    return [
      ['e', this.meta.rootNoteId, this.root?.headRelay || '', 'root', this.root?.event.pubkey].filter(
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
    return repostStore.reposts.get(this.id)?.size || 0
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

  toggleReplies(open?: boolean) {
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

  react(client: NostrClient, reaction: string) {
    client.reactions
      .publish(this.event, reaction)
      .pipe(
        filter((event) => event[2] === true),
        take(1),
      )
      .subscribe({
        error: (error: unknown) => {
          if (error instanceof Error) {
            toast(error.message)
          }
        },
        next: () => {},
      })
  }

  subscribe(
    client: NostrClient,
    options: {
      zaps?: boolean
      replies?: boolean
      reactions?: boolean
      reposts?: boolean
    } = {},
  ): Observable<Note | Repost | NostrEvent | [NostrEvent, ZapMetadataDB]> {
    return merge(
      options.zaps !== false ? this.subscribeZaps(client) : EMPTY,
      options.replies !== false ? this.subscribeReplies(client) : EMPTY,
      options.reposts !== false ? this.subscribeReposts(client) : EMPTY,
      options.reactions !== false ? this.subscribeReactions(client) : EMPTY,
    )
    // TODO: better tests
    // finalize(() => {
    //   runInAction(() => {
    //     // this.localLastSyncedAt = Date.now()
    //     // storage.metadata.insert({ ...this.metadata, lastSyncedAt: this.localLastSyncedAt })
    //   })
    // }),
  }

  subscribeReposts(client: NostrClient) {
    return client.reposts.subFromNote(this)
  }

  subscribeZaps(client: NostrClient) {
    return client.zaps.subFromNote(this)
  }

  subscribeReactions(client: NostrClient) {
    return client.reactions.subFromNote(this)
  }

  subscribeReplies(client: NostrClient) {
    this.setRepliesStatus('LOADING')
    return client.notes.subReplies(this.metadata).pipe(
      // get reactions, reposts of replies
      mergeMap((note) => note.subscribe(client, { replies: false })),
      finalize(() => {
        this.setRepliesStatus('LOADED')
      }),
    )
  }
}
