import type { Observable, ThrottleConfig } from 'rxjs'
import {
  BehaviorSubject,
  EMPTY,
  ignoreElements,
  interval,
  map,
  skipUntil,
  Subject,
  take,
  takeWhile,
  tap,
  throttleTime,
  timer,
} from 'rxjs'
import { createFilter } from './helpers/createFilter'
import { createFilterPagination } from './helpers/createPaginationFilter'
import { paginateFilter } from './helpers/paginateFilter'
import type { NostrFilter } from './types'

export type PaginationBehaviorOptions = {
  range?: number
  debounceTime?: number
  skipUntil?: number
}

const throttleConfig: ThrottleConfig = {
  leading: true,
  trailing: true,
}

const MAX_CHUNK = 20

export class PaginationSubject {
  private state: BehaviorSubject<NostrFilter>
  private subject = new Subject<void>()
  $: Observable<NostrFilter>

  chunk = MAX_CHUNK
  until = Infinity

  constructor(
    public filter: NostrFilter,
    public options: PaginationBehaviorOptions = {},
  ) {
    this.state = new BehaviorSubject(
      options.range ? createFilterPagination(filter, options.range) : createFilter(filter),
    )
    this.$ = this.state.asObservable()

    this.subject
      .pipe(
        skipUntil(timer(options.skipUntil || 1000)),
        throttleTime(options.debounceTime || 1200, undefined, throttleConfig),
      )
      .subscribe(() => {
        if (this.options.range) {
          this.state.next(paginateFilter(this.state.value, this.options.range))
        } else {
          this.state.next({ ...this.state.value, until: this.until })
        }
      })
  }

  get value() {
    return this.state.value
  }

  get authors() {
    return this.value.authors || []
  }

  reset() {
    this.state.next(
      this.options.range ? createFilterPagination(this.value, this.options.range) : createFilter(this.filter),
    )
  }

  increaseRange(range?: number) {
    if (this.options.range) {
      this.options.range = range || this.options.range * 5
    }
  }

  setFilter(filter: NostrFilter) {
    this.state.next(
      this.options.range
        ? createFilterPagination({ ...this.value, ...filter }, this.options.range)
        : createFilter({ ...this.value, ...filter }),
    )
    return this.$
  }

  paginateIfEmpty(notes: Map<string, unknown>, min = 5) {
    if (this.options.range) {
      return interval(5000).pipe(
        map(() => notes.size),
        takeWhile((size) => size < min),
        take(10),
        tap(() => {
          this.increaseRange()
          this.subject.next()
        }),
        ignoreElements(),
      )
    }
    return EMPTY
  }

  paginate() {
    this.subject.next()
  }
}
