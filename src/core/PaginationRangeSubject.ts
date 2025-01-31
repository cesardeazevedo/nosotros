import type { ThrottleConfig } from 'rxjs'
import { BehaviorSubject, Subject, skipUntil, throttleTime, timer } from 'rxjs'
import { createFilterPagination } from './helpers/createPaginationFilter'
import { paginateFilter } from './helpers/paginateFilter'
import type { NostrFilter } from './types'

export type PaginationBehaviorOptions = {
  /**
   * Range in minutes
   */
  range?: number
  debounceTime?: number
  skipUntil?: number
}

const throttleConfig: ThrottleConfig = {
  leading: true,
  trailing: true,
}

export class PaginationSubject extends BehaviorSubject<NostrFilter> {
  private subject$ = new Subject<void>()
  private range: number
  private debounceTime: number
  private skipUntil: number

  initialValue: NostrFilter

  constructor(initialValue: NostrFilter, options?: PaginationBehaviorOptions) {
    const range = options?.range || 60

    super(createFilterPagination(initialValue, range))

    this.range = range
    this.debounceTime = options?.debounceTime || 1500
    this.skipUntil = options?.skipUntil || 1000
    this.initialValue = initialValue

    this.subject$
      .pipe(skipUntil(timer(this.skipUntil)), throttleTime(this.debounceTime, undefined, throttleConfig))
      .subscribe(() => {
        super.next(paginateFilter(this.value, this.range))
      })
  }

  get value() {
    return this.getValue()
  }

  get authors() {
    return this.value.authors || []
  }

  next() {
    this.subject$.next()
  }

  reset() {}

  increaseRange(range?: number) {
    this.range = range || this.range * 2
  }

  setFilter(filter: NostrFilter) {
    super.next(createFilterPagination({ ...this.value, ...filter }, this.range))
    return this
  }
}
