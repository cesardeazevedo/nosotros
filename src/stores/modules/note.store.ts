import { Kind } from 'constants/kinds'
import { action, computed, makeAutoObservable, observable, toJS } from 'mobx'
import { Event, nip19 } from 'nostr-tools'
import { EMPTY, timeout } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { IMeta } from 'stores/core/imeta'
import { RelayHints } from 'stores/core/relayHints'
import { EventDB } from 'stores/nostr/notes.store'
import type { RootStore } from 'stores/root.store'
import { ContentParser } from 'utils/contentParser'
import { ObjectValues, dedupe, isAuthorTag, isEventTag, isMention, isQuoteTag } from 'utils/utils'

const Status = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
} as const

export class Note {
  id: string
  event: Event
  imeta: IMeta
  content: ContentParser
  hints: RelayHints
  // This is a list of revelant authors of the post, for means of sorting replies, any mentioned
  relevantAuthors: string[] = []

  repliesOpen: boolean | null = null
  repliesStatus: ObjectValues<typeof Status> = Status.IDLE

  constructor(
    private root: RootStore,
    event: Event,
    content?: ContentParser | undefined | null,
    imeta?: IMeta | undefined | null,
  ) {
    makeAutoObservable(this, {
      event: observable,
      relevantAuthors: observable,
      repliesOpen: observable,
      repliesStatus: observable,
      isRootReply: computed,
      repliesTags: computed,
      openRepliesDialog: action.bound,
      toggleReplies: action.bound,
    })
    this.id = event.id
    this.event = event
    this.imeta = imeta || new IMeta(event.tags)
    this.content = content || new ContentParser(event, this.imeta)
    this.hints = new RelayHints(this)
  }

  static mergeRelayHints(notes: Note[]) {
    return RelayHints.merge(notes.map((note) => note.hints.parse()))
  }

  static deserialize(root: RootStore, event: EventDB) {
    return new Note(
      root,
      event.event,
      ContentParser.deserialize(event.event, event.content, event.references),
      IMeta.deserialize(event.imeta),
    )
  }

  serialize(): EventDB {
    return {
      id: this.id,
      event: toJS(this.event),
      pubkey: this.event.pubkey,
      createdAt: this.event.created_at,
      hints: this.relayHints,
      imeta: this.imeta.parse(),
      content: this.content.parse(),
      hasMedia: this.content.hasMedia,
      references: this.content.references,
    }
  }

  get nevent() {
    // const eventRelays = this.root.nostr.getEventRelays(this.id)
    return nip19.neventEncode({
      id: this.id,
      author: this.event.pubkey,
      kind: this.event.kind,
      relays: this.seenOn,
    })
  }

  get user() {
    return this.root.users.getUserById(this.event.pubkey)
  }

  get seenOn() {
    return this.root.nostr.getEventRelays(this.id)
  }

  get metadata() {
    return this.imeta.metadata
  }

  get hasReplies() {
    return this.replies.length > 0
  }

  get isFollowing() {
    return this.root.contacts.isFollowing(this.event.pubkey)
  }

  get isRelevant() {
    return this.isFollowing || this.relevantAuthors.indexOf(this.event.pubkey) > -1
  }

  isFollowingOrHasFollowingReply(note: Note) {
    return (
      note.isRelevant ||
      // check if note has a reply from someone you follow
      this.root.notes.getNoteById(note.event.id)?.replies.some((note) => note.isRelevant)
    )
  }

  get replies() {
    return Array.from(this.root.notes.replies.get(this.event.id)?.replies || [])
      .map((id) => this.root.notes.notes.get(id))
      .filter((x): x is Note => !!x)
  }

  get repliesSorted() {
    return (
      this.replies
        // Sort by following or has following reply
        .sort((note1, note2) => {
          const a = this.isFollowingOrHasFollowingReply(note1)
          const b = this.isFollowingOrHasFollowingReply(note2)
          if (a && !b) {
            return -1
          }
          return 1
        })
    )
  }

  // Only short replies from people you follow
  get repliesPreview() {
    return this.replies.filter((note) => this.isFollowingOrHasFollowingReply(note)).slice(0, 1)
  }

  get totalReplies() {
    function getReplyCount(note: Note): number {
      return note.replies.length + note.replies.reduce((acc, note) => acc + getReplyCount(note), 0)
    }
    return getReplyCount(this)
  }

  get repliesTags() {
    return this.event.tags.filter((tag) => isEventTag(tag) && !isMention(tag))
  }

  get rootNoteId() {
    return !this.isRoot ? this.repliesTags[0][1] : this.id
  }

  get parentNoteId() {
    return this.repliesTags[this.repliesTags.length - 1]?.[1] || undefined
  }

  get isRoot() {
    return this.repliesTags.length === 0
  }

  get isRootReply() {
    return this.repliesTags.length === 1
  }

  get isReplyOfAReply() {
    return this.repliesTags.length > 1
  }

  get authorsTags() {
    return this.event.tags.filter((tag) => isAuthorTag(tag))
  }

  get relayHints() {
    return this.hints.parse()
  }

  get mentionedNotes() {
    const tags = this.event.tags.filter((tag) => (isEventTag(tag) && isMention(tag)) || isQuoteTag(tag))
    return dedupe(
      tags.map((x) => x[1]),
      this.content.mentionedNotes,
    )
  }

  get mentionedAuthors() {
    return dedupe(
      [this.event.pubkey],
      this.authorsTags.map((x) => x[1]),
      this.content.mentionedAuthors,
    )
  }

  openReplies() {
    if (!this.repliesOpen) {
      this.repliesOpen = true
      this.subscribeReplies()
    }
  }

  toggleReplies() {
    if (!this.repliesOpen) {
      this.openReplies()
    } else {
      this.repliesOpen = false
    }
  }

  openRepliesDialog() {
    this.subscribeReplies()
    this.root.dialogs.pushReply(this.id)
  }

  setRepliesStatus(state: ObjectValues<typeof Status>) {
    this.repliesStatus = state
  }

  subscribeReplies() {
    this.setRepliesStatus(Status.LOADING)
    const filter = new Filter(this.root, { kinds: [Kind.Text], '#e': [this.event.id] })
    const sub = this.root.notes.subscribe(filter, {
      relayHints: {
        fallback: {
          [this.event.id]: [this.event.pubkey],
        },
      },
    })
    sub
      .pipe(
        timeout({
          first: 4000,
          with: () => {
            this.setRepliesStatus(Status.LOADED)
            // Set some empty-replies state?
            return EMPTY
          },
        }),
      )
      .subscribe((notes) => {
        this.setRepliesStatus(Status.LOADED)
        this.root.subscriptions.subReactions(notes.map((e) => e.id))
      })
  }
}
