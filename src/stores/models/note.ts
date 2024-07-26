import { makeAutoObservable } from 'mobx'
import { nip19 } from 'nostr-tools'
import type { NostrClient } from 'nostr/nostr'
import type { NoteDB } from 'nostr/types'
import { filter, take, type Subscription } from 'rxjs'
import { toast } from 'sonner'
import { noteStore } from 'stores/nostr/notes.store'
import { seenStore } from 'stores/nostr/seen.store'
import { userStore } from 'stores/nostr/users.store'

type ReplyStatus = 'IDLE' | 'LOADING' | 'LOADED'

class Note {
  repliesOpen = false

  repliesStatus: ReplyStatus = 'IDLE'

  private client: NostrClient
  private sub?: Subscription
  private subReactions?: Subscription
  private subZaps?: Subscription

  constructor(
    public data: NoteDB,
    client: NostrClient,
  ) {
    makeAutoObservable(this, { data: false })

    this.client = client
  }

  get id() {
    return this.data.id
  }

  get event() {
    return this.data
  }

  get meta() {
    return this.data.metadata
  }

  get user() {
    return userStore.get(this.event.pubkey)
  }

  get seenOn() {
    return seenStore.get(this.id) || []
  }

  get totalReplies() {
    return this.replies.length
  }

  get isCurrentUserFollowing() {
    return false
  }

  get nevent() {
    // Replace it with an observable
    return nip19.neventEncode({
      id: this.id,
      author: this.event.pubkey,
      kind: this.event.kind,
      relays: this.seenOn,
    })
  }

  get replies() {
    const data = noteStore.replies.get(this.id) || []
    return data.map((id) => noteStore.get(id)).filter((note): note is Note => !!note)
  }

  get repliesPreview() {
    return []
  }

  get repliesSorted() {
    return this.replies
  }

  get hasReplies() {
    return true
  }

  setRepliesStatus(state: ReplyStatus) {
    if (this.repliesStatus !== state) {
      this.repliesStatus = state
    }
  }

  toggleReplies(open?: boolean) {
    this.repliesOpen = open ?? !this.repliesOpen
    if (this.repliesOpen) {
      this.subscribeZaps()
      this.subscribeReplies()
      this.subscribeReactions()
    } else {
      this.sub?.unsubscribe()
      this.subReactions?.unsubscribe()
    }
  }

  react(reaction: string) {
    this.client.reactions
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

  subscribeOnScroll() {
    this.subscribeZaps()
    this.subscribeReactions()
  }

  subscribeZaps() {
    this.subZaps = this.client.zaps.subFromNote(this.data).subscribe()
    return this.subZaps
  }

  subscribeReactions() {
    this.subReactions = this.client.reactions.subFromNote(this.data).subscribe()
    return this.subReactions
  }

  subscribeReplies() {
    this.setRepliesStatus('LOADING')
    this.sub = this.client.notes.subReplies(this.data).subscribe({
      complete: () => {
        this.setRepliesStatus('LOADED')
      },
      next: (event) => {
        const note = new Note(event, this.client)
        noteStore.add(note)
        this.setRepliesStatus('LOADED')
      },
    })
  }
}

export default Note
