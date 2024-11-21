import { bufferTime } from '@/core/operators/bufferTime'
import { PaginationSubject } from '@/core/PaginationSubject'
import type { NostrFilter } from '@/core/types'
import { Duration } from 'luxon'
import { action, computed, makeAutoObservable, observable, values } from 'mobx'
import { filter, identity, ignoreElements, interval, map, merge, mergeMap, takeWhile, tap } from 'rxjs'
import type { Notification } from '../models/notification'
import { rootStore } from '../root.store'
import type { NostrContext } from '../ui/nostr.context'
import type { ModuleInterface } from './interface'

export type NotificationOptions = {
  type?: 'notification'
  id?: string
  pubkey: string
  range?: number
  nostrContext?: NostrContext
}

export class NotificationModule implements ModuleInterface {
  data = observable.map<string, Notification>()

  id: string
  options: NotificationOptions
  context: NostrContext
  pagination$: PaginationSubject

  constructor(options: NotificationOptions) {
    makeAutoObservable(this, {
      sorted: computed.struct,
      list: computed.struct,
      paginate: action.bound,
    })

    this.id = options.id || Math.random().toString().slice(2, 10)

    this.options = {
      ...options,
      id: this.id,
      range: Duration.fromObject({ days: 7 }).as('minutes'),
      type: 'notification',
    }
    this.context = options.nostrContext || rootStore.rootContext

    const filter = { '#p': [options.pubkey] } as NostrFilter
    this.pagination$ = new PaginationSubject(filter, { range: this.options.range })
  }

  get client() {
    return this.context.client
  }

  get sorted() {
    return values(this.data).toSorted((a, b) => (a.event.created_at > b.event.created_at ? -1 : 1))
  }

  get list() {
    return this.sorted
  }

  // Paginate again increasing the pagination range if the feed still less than 5 posts.
  private paginateOnEmpty() {
    return interval(3000).pipe(
      map(() => this.data),
      takeWhile((data) => data.size < 20),
      tap(() => {
        this.pagination$.increaseRange()
        this.paginate()
      }),
      ignoreElements(),
    )
  }

  add(data: Notification) {
    if (!this.data.has(data.id)) {
      this.data.set(data.id, data)
    }
  }

  paginate() {
    this.pagination$.next()
  }

  start() {
    return merge(this.client.notifications.subscribePagination(this.pagination$), this.paginateOnEmpty()).pipe(
      bufferTime(1000),
      mergeMap(identity),
      filter((notification) => notification.pubkey !== this.options.pubkey),
      tap((notification) => this.add(notification)),
    )
  }
}
