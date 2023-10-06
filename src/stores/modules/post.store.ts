import { Kind } from 'constants/kinds'
import { action, computed, makeAutoObservable, observable, values } from 'mobx'
import { Event } from 'nostr-tools'
import { EMPTY, timeout } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { bufferPosts } from 'stores/core/operators'
import { RelayHints } from 'stores/core/subscription'
import type { RootStore } from 'stores/root.store'
import { TokenType } from 'utils/contentParser'
import { ObjectValues, groupKeysToArray, isAuthorTag, isEventTag, isMention, isQuoteTag } from 'utils/utils'

const Status = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
} as const

export class PostStore {
  id: string
  event: Event
  filter: Filter

  parent: PostStore | null = null

  replies = observable.map<string, PostStore>()
  repliesOpen: boolean | null = null
  repliesStatus: ObjectValues<typeof Status> = Status.IDLE

  heightSize = 0
  totalReplies = 0

  constructor(
    private root: RootStore,
    event: Event,
  ) {
    makeAutoObservable(this, {
      addReply: action,
      addReplies: action,
      repliesTree: computed,
      repliesOpen: observable,
      repliesStatus: observable,
      isRootReply: computed,
      repliesTags: computed,
      totalReplies: observable,
      openRepliesDialog: action.bound,
      toggleReplies: action.bound,
    })
    this.id = event.id
    this.event = event
    // replies filter
    this.filter = new Filter(this.root, { kinds: [Kind.Text], '#e': [event.id] })

    this.root.notes.add(event)
  }

  static mergeTags(tags: Event['tags'][]) {
    return tags
      .flat()
      .map((x) => x[1])
      .filter((x) => !!x)
  }

  static mergeRelayHints(relayHints: RelayHints[]) {
    const authors = groupKeysToArray(relayHints.map((x) => x.authors || {})) as RelayHints['authors']
    const ids = groupKeysToArray(relayHints.map((x) => x.ids || {})) as RelayHints['ids']
    return { authors, ids }
  }

  get content() {
    return this.root.notes.getParsedContentById(this.id)
  }

  get hasReplies() {
    return this.replies.size > 0
  }

  get rootNoteId() {
    return !this.isRoot ? this.repliesTags[0][1] : this.id
  }

  get parentNoteId() {
    return this.repliesTags[this.repliesTags.length - 1]?.[1]
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

  get repliesTags() {
    return this.event.tags.filter((tag) => isEventTag(tag) && !isMention(tag))
  }

  /**
   * Get all relay hints based on tags or nostr:note
   */
  async relayHints() {
    const tagHints = this.event.tags
      .filter((tag) => !!tag[2])
      .reduce((acc, tag) => {
        const [, id, value] = tag
        const updateHints = (key: keyof RelayHints) => {
          acc[key] ??= {}
          acc[key]![id] ??= []
          acc[key]![id].push(value)
        }
        if (isAuthorTag(tag)) {
          updateHints('authors')
        } else if (isEventTag(tag) || isQuoteTag(tag)) {
          updateHints('ids')
        }
        return acc
      }, {} as RelayHints)

    const userRelays = await this.root.userRelays.getRelaysFromAuthor(this.event.pubkey)

    // In case of quoted notes, we want to put that with the author relays
    const contentHints = this.noteContent?.reduce((acc, token) => {
      return {
        ...acc,
        [token]: userRelays,
      }
    }, {})

    return {
      authors: tagHints.authors || {},
      ids: groupKeysToArray([tagHints.ids || {}, contentHints || {}]) as RelayHints['ids'],
    }
  }

  get mentionsTags() {
    return this.event.tags.filter((tag) => (isEventTag(tag) && isMention(tag)) || isQuoteTag(tag))
  }

  get mediaContent() {
    return this.content?.content?.filter((x) => x.kind === TokenType.IMAGE).map((x) => x.content)
  }

  get noteContent() {
    return this.content?.content?.filter((x) => x.kind === TokenType.NOTE).map((x) => x.content) as string[]
  }

  get repliesTree() {
    const root = new Map<string, PostStore>()

    for (const reply of values(this.replies)) {
      const parentId = reply.parentNoteId
      if (parentId) {
        if (this.event.id === parentId) {
          root.set(reply.id, reply)
        } else {
          const parentReply = this.replies.get(parentId)
          if (parentReply) {
            parentReply.addReply(reply)
          }
        }
      }
    }
    return root
  }

  toggleReplies() {
    this.repliesOpen = !(this.repliesOpen || false)
    if (this.repliesOpen) {
      this.subscribeReplies()
    }
  }

  openRepliesDialog() {
    this.subscribeReplies()
    this.root.dialogs.pushReply(this)
  }

  addReply(post: PostStore) {
    this.replies.set(post.id, post)
    this.totalReplies = this.replies.size
    post.parent = this
  }

  addReplies(posts: PostStore[]) {
    posts.forEach((post) => {
      this.addReply(post)
    })
  }

  setRepliesStatus(state: ObjectValues<typeof Status>) {
    this.repliesStatus = state
  }

  subscribeReplies() {
    this.setRepliesStatus(Status.LOADING)
    const sub = this.root.subscriptions.subNotes(this.filter)
    sub.onEvent$
      .pipe(
        bufferPosts(this.root),
        timeout({
          first: 4000,
          with: () => {
            this.setRepliesStatus(Status.LOADED)
            // Set some empty-replies state?
            return EMPTY
          },
        }),
      )
      .subscribe((posts) => {
        this.setRepliesStatus(Status.LOADED)
        this.root.subscriptions.subReactions(posts.map((e) => e.id))
        posts.forEach((post) => {
          this.addReply(post)
        })
      })
  }
}
