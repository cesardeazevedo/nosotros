import { Kind } from 'constants/kinds'
import { action, makeAutoObservable, observable } from 'mobx'
import { Filter } from 'stores/core/filter'
import { RelayHints, Subscription } from 'stores/core/subscription'
import type { RootStore } from 'stores/root.store'
import { dedupe } from 'utils/utils'
import { PostStore } from './post.store'

export type PostRow = {
  noteId: string
  timestamp: number
  author: string
  replies: PostRow[]
}

type Options = {
  authors: string[]
  contacts?: boolean
  pagination?: boolean
  range?: number
}

export class FeedStore {
  sub: Subscription | undefined
  authors: string[]
  filter: Filter
  contacts: boolean

  feed = observable.map<string, PostStore>()
  tempReplies = new Map<string, PostStore[]>()

  constructor(
    private root: RootStore,
    options: Options,
  ) {
    makeAutoObservable(this, {
      feed: observable,
      add: action,
      filter: false,
      subscribe: false,
      tempReplies: false,
    })

    this.filter = new Filter(
      this.root,
      {
        kinds: [Kind.Text, Kind.Article],
      },
      { pagination: options.pagination ?? true, range: options.range },
    )

    this.authors = options.authors
    this.contacts = options.contacts || false
  }

  add(post: PostStore) {
    const rootNoteId = post.rootNoteId
    if (!post.isRoot) {
      if (!this.feed.has(rootNoteId)) {
        this.tempReplies.set(rootNoteId, [...(this.tempReplies.get(rootNoteId) || []), post])
      } else {
        this.feed.get(rootNoteId)?.addReply(post)
      }
    } else {
      post.addReplies(this.tempReplies.get(post.id) || [])
      this.feed.set(post.id, post)
    }
  }

  addPosts(posts: PostStore[]) {
    posts.forEach((post) => {
      if (!this.feed.has(post.id)) {
        this.add(post)
      }
    })
  }

  paginate(range?: number) {
    this.filter.nextPage(range)
    this.subNotesByAuthors(this.authors)
  }

  subscribeReactions(ids: string[]) {
    this.root.subscriptions.subReactions(ids)
  }

  async getPostsMetadata(posts: PostStore[]) {
    const rootNotes = posts.filter((x) => !x.isRoot && !x.isReplyOfAReply).map((x) => x.rootNoteId)
    const mentionNotes = PostStore.mergeTags(posts.map((x) => x.mentionsTags))
    const mentionNotesFromContent = posts.map((post) => post.noteContent?.map((x) => x.content) || []).flat()
    const relayHints = PostStore.mergeRelayHints(await Promise.all(posts.map((post) => post.relayHints()).flat()))
    return { rootNotes, mentionNotes, mentionNotesFromContent, relayHints }
  }

  /**
   * Subscribe to related/parent notes, and add them to the feed
   */
  subRelatedNotes(ids: string[], relayHints?: RelayHints) {
    // We might want to add pagination here too, since we don't want to load related posts that are too old
    const sub = this.root.subscriptions.subNotes(new Filter(this.root, { kinds: [Kind.Text, Kind.Article], ids }), {
      relayHints,
    })
    sub.posts$.subscribe(async (posts) => {
      this.addPosts(posts)
      // related notes might also have mentions
      const metadata = await this.getPostsMetadata(posts)
      const notes = dedupe(metadata.mentionNotes, metadata.mentionNotesFromContent)
      this.root.subscriptions.subNotes(new Filter(this.root, { kinds: [Kind.Text, Kind.Article], ids: notes }), {
        relayHints: metadata.relayHints,
      })
    })
  }

  /**
   * Subscribe to the authors notes
   */
  subNotesByAuthors(authors: string[]) {
    this.filter.addAuthors(authors)
    const sub = this.root.subscriptions.subNotes(this.filter)
    sub.posts$.subscribe(async (posts) => {
      this.addPosts(posts)

      const metadata = await this.getPostsMetadata(posts)

      const relatedNotes = dedupe(metadata.rootNotes, metadata.mentionNotes, metadata.mentionNotesFromContent)
      if (relatedNotes.length > 0) {
        this.subRelatedNotes(relatedNotes, metadata.relayHints)
      }

      // Check if the current pagination range didn't received any `root` posts, if so, try to paginate again.
      if (posts.filter((x) => x.isRoot).length === 0) {
        this.paginate(this.filter.options.range * 2)
      }
    })

    return sub
  }

  /**
   * Subscribe to the authors following list
   */
  async subNotesByAuthorsContacts() {
    const contactList = await this.root.contacts.fetchByAuthor(this.authors[0])
    const authors = contactList.tags.map((tag) => tag[1])
    if (authors?.length !== 0) {
      this.authors.push(...authors)
      this.filter.setInitialPaginationRange(this.authors.length > 100 ? 10 : 60)
      this.subNotesByAuthors(this.authors)
    }
    const sub = this.root.subscriptions.subContacts(this.authors[0])
    sub.subscribe((event) => {
      const contacts = event.tags.map((tag) => tag[1])
      const newContacts = contacts.filter((x) => !authors.includes(x))
      // New contacts found, subscribe to their notes
      if (newContacts.length !== 0) {
        this.authors.push(...newContacts)
        this.filter.setInitialPaginationRange(this.authors.length > 100 ? 10 : 60)
        this.subNotesByAuthors(newContacts)
      }
    })
  }

  subscribe() {
    if (this.contacts) {
      this.subNotesByAuthorsContacts()
    } else {
      this.subNotesByAuthors(this.authors)
    }
    this.root.subscriptions.subUsers(this.authors)
  }
}
