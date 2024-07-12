import type { SubscriptionOptions } from 'core/NostrSubscription'
import { PaginationSubject } from 'core/PaginationSubject'
import type { NostrFilter } from 'core/types'
import { action, keys, makeObservable, observable, values } from 'mobx'
import type { NostrClient } from 'nostr/nostr'
import type { NostrSettings } from 'nostr/settings'
import type { NoteDB } from 'nostr/types'
import type { Subscription } from 'rxjs'
import { type Observable } from 'rxjs'
import { appState } from 'stores/app.state'
import Note from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import type { ModuleInterface } from './interface'

type FeedType = 'subFeed' | 'subFeedFromFollows' | 'subFeedFromFollowers'

export interface FeedOptions {
  id: string
  type?: 'feed'
  pipeline: FeedType
  filter: NostrFilter
  range?: number
  subscription?: SubscriptionOptions
  client?: {
    pubkey?: string
    relays?: string[]
    settings?: NostrSettings
  }
}

export class FeedModule implements ModuleInterface {
  id: string

  client: NostrClient
  private pagination$: PaginationSubject

  _subscription: Subscription | undefined

  options: FeedOptions

  data = observable.map<string, string>({}, { deep: false, proxy: false })

  constructor(options: FeedOptions) {
    makeObservable(this, {
      data: observable,
      options: false,
      add: action,
      reset: action,
    })

    this.id = options.id
    this.options = options

    console.log('client ref')
    this.client = appState.client
    this.pagination$ = new PaginationSubject(options.filter, { range: this.options.range })
  }

  get list() {
    return [...keys(this.data)] as string[]
  }

  add(note: NoteDB) {
    if (!this.data.has(note.id)) {
      this.data.set(note.id, note.id)
    }
  }

  reset() {
    this.data.clear()
  }

  applyFilters(filter: NostrFilter) {
    this.reset()
    this.stop()
    this.pagination$ = new PaginationSubject(filter, { range: this.options.range })
    this.start()
  }

  paginate() {
    this.pagination$.next()
  }

  onRangeChange(index: number) {
    const id = values(this.data)[index]
    const note = noteStore.get(id)
    if (note) {
      note.subscribeReactions()
    }
  }

  start() {
    if (!this._subscription) {
      switch (this.options.pipeline) {
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
    }
  }

  stop() {
    this._subscription?.unsubscribe()
    this._subscription = undefined
  }

  private subFeed() {
    return this.subscribe(this.client.feeds.subscribe(this.pagination$))
  }

  private subFeedFromFollows() {
    return this.subscribe(this.client.feeds.subscribeFromFollows(this.pagination$))
  }

  private subscribe(notes$: Observable<NoteDB>) {
    this._subscription = notes$.subscribe({
      next: (event) => {
        noteStore.add(new Note(event, this.client))
        // We never put replies as root notes on the feed
        if (event.metadata.isRoot) {
          this.add(event)
        }
      },
    })
    return this._subscription
  }
}
