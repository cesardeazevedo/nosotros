import { Kind } from '@/constants/kinds'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import { PaginationSubject } from 'core/PaginationSubject'
import type { NostrFilter } from 'core/types'
import { action, computed, makeAutoObservable, observable, values } from 'mobx'
import { EMPTY, ignoreElements, interval, map, merge, takeWhile, tap, type Observable } from 'rxjs'
import { rootStore } from '@/stores/root.store'
import type { Note } from 'stores/models/note'
import { Repost } from '../models/repost'
import type { NostrContext } from '../ui/nostr.context'
import type { ModuleInterface } from './interface'

type FeedType = 'subFeed' | 'subFeedFromFollows' | 'subFeedFromFollowers'

export interface FeedOptions {
  id: string
  type?: 'feed'
  feed: FeedType
  filter: NostrFilter
  range: number
  subscription?: SubscriptionOptions
  context?: NostrContext
}

export class FeedModule implements ModuleInterface {
  id: string

  context: NostrContext
  private pagination$: PaginationSubject

  options: FeedOptions

  data = observable.map<string, Note | Repost>({})
  published = observable.map<string, Note>({})

  constructor(options: FeedOptions) {
    makeAutoObservable(this, {
      data: observable,
      paginate: action.bound,
      onRangeChange: action.bound,
      list: computed.struct,
      options: false,
    })

    this.id = options.id

    this.options = {
      ...options,
      filter: { kinds: [Kind.Text], ...options.filter },
    }

    this.context = options.context || rootStore.rootContext
    this.pagination$ = new PaginationSubject(this.options.filter, { range: this.options.range })
  }

  get client() {
    return this.context.client
  }

  get list() {
    return [...this.listPublished, ...values(this.data)]
  }

  get listPublished() {
    return values(this.published)
  }

  add(note: Note | Repost) {
    if (!this.data.has(note.id)) {
      this.data.set(note.id, note)
    }
  }

  addPublishedNote(note: Note) {
    this.published.set(note.id, note)
  }

  reset() {
    this.data.clear()
  }

  applyFilters(filter: NostrFilter) {
    this.reset()
    this.pagination$ = new PaginationSubject(filter, { range: this.options.range })
  }

  paginate() {
    this.pagination$.next()
  }

  onRangeChange(index: number) {
    const note = this.list[index]
    if (note) {
      if (note instanceof Repost) {
        return note.note.subscribe(this.client)
      } else {
        return note.subscribe(this.client)
      }
    }
  }

  start() {
    switch (this.options.feed) {
      case 'subFeed': {
        return this.subFeed()
      }
      case 'subFeedFromFollows': {
        return this.subFeedFromFollows()
      }
      case 'subFeedFromFollowers': {
        // todo
        break
      }
    }
    return EMPTY
  }

  // Paginate again increasing the pagination range if the feed still less than 5 posts.
  private paginateOnEmpty() {
    return interval(3500).pipe(
      map(() => this.data),
      takeWhile((data) => data.size < 5),
      tap(() => {
        this.pagination$.increaseRange()
        this.paginate()
      }),
      ignoreElements(),
    )
  }

  private subFeed() {
    return this.subscribe(this.client.feeds.subscribe(this.pagination$))
  }

  private subFeedFromFollows() {
    return this.subscribe(this.client.feeds.subscribeFromFollows(this.pagination$))
  }

  private subscribe(notes$: Observable<Note | Repost>) {
    return merge(notes$, this.paginateOnEmpty()).pipe(
      tap((note) => {
        this.add(note)
      }),
    )
  }
}
