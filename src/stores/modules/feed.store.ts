import { Kind } from 'constants/kinds'
import { action, makeAutoObservable, observable } from 'mobx'
import { Subject, map, of, take, throttleTime, timeout } from 'rxjs'
import { Filter } from 'stores/core/filter'
import { bufferTime } from 'stores/core/operators'
import type { RootStore } from 'stores/root.store'
import { dedupe } from 'utils/utils'
import type { Note } from './note.store'

export type FeedOptions = {
  name?: string
  authors: string[]
  contacts?: boolean
  pagination?: boolean
  paginationRetryTimeout?: number
  range?: number
}

export class FeedStore {
  authors: string[]
  filter: Filter
  paginationRetryTimeout: number

  feed = observable.map<string, Note>()
  options: FeedOptions

  paginate$ = new Subject<number | void>()
  reactions$ = new Subject<string[]>()

  constructor(
    private root: RootStore,
    options: FeedOptions,
  ) {
    makeAutoObservable(this, {
      feed: observable,
      add: action,
      authors: false,
      filter: false,
      subscribe: false,
      options: false,
      paginationRetryTimeout: false,
    })

    this.options = {
      pagination: true,
      ...options,
    }

    this.filter = new Filter(
      this.root,
      {
        kinds: [Kind.Text, Kind.Article],
      },
      { pagination: this.options.pagination, range: options.range },
    )

    this.authors = options.authors
    this.paginationRetryTimeout = options.paginationRetryTimeout || 2000

    this.reactions$
      .pipe(
        bufferTime(2000),
        map((ids) => dedupe(ids)),
      )
      .subscribe((ids) => {
        this.root.reactions.subscribe(ids)
      })

    this.paginate$
      .pipe(throttleTime(2000, undefined, { leading: true, trailing: true }))
      .subscribe(() => this.paginate())
  }

  add(note: Note) {
    // We never put replies as root notes on feed
    if (note.isRoot && !this.feed.has(note.id)) {
      this.feed.set(note.id, note)
    }
  }

  paginate(range?: number) {
    if (this.options.pagination) {
      this.filter.nextPage(range)
      this.subNotesByAuthors(this.authors)
    }
  }

  /**
   * Subscribe to the authors notes
   */
  subNotesByAuthors(authors: string[]) {
    this.filter.addAuthors(authors)
    const sub = this.root.notes.subscribe(this.filter)

    sub.subscribe(async (posts) => {
      posts.forEach((note) => {
        this.add(note)
        // This is a hacky since if the user isn't logged, we are pushing default authors for the feed
        if (!this.root.auth.pubkey) {
          note.relevantAuthors.push(...this.authors)
        }
      })
    })

    if (this.filter.options.pagination) {
      // Check for empty responses after 5 seconds, then paginate again
      sub.pipe(timeout({ first: this.paginationRetryTimeout, with: () => of([]) }), take(1)).subscribe((posts) => {
        if (posts.length === 0 || posts.filter((x) => x.isRoot).length === 0) {
          // No posts found, paginate again increasing the pagination range
          this.paginate$.next(this.filter.options.range * 2)
        }
      })
    }

    return sub
  }

  /**
   * Subscribe to the authors following list
   */
  async subNotesByAuthorsContacts() {
    const contactList = await this.root.contacts.fetchByAuthor(this.authors[0])
    const authors = Object.keys(contactList?.contacts || {})
    if (authors?.length !== 0) {
      this.authors.push(...authors)
      this.filter.setInitialPaginationRange(this.authors.length > 100 ? 20 : 120)
      this.subNotesByAuthors(this.authors)
    }
    const sub = this.root.subscriptions.subContacts(this.authors[0])
    sub.subscribe((event) => {
      const contacts = event.tags.map((tag) => tag[1])
      const newContacts = contacts.filter((x) => !authors.includes(x))
      // New contacts found, subscribe to their notes
      if (newContacts.length !== 0) {
        this.authors.push(...newContacts)
        this.subNotesByAuthors(newContacts)
      }
    })
  }

  subscribe() {
    if (this.options.contacts) {
      this.subNotesByAuthorsContacts()
    } else {
      this.subNotesByAuthors(this.authors)
    }
    this.root.users.subscribe(this.authors)
  }
}
