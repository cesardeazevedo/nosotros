import type { ThrottleConfig } from 'rxjs'
import { BehaviorSubject, Subject, skipUntil, throttleTime, timer } from 'rxjs'
import { createFilter } from './helpers/createFilter'
import type { NostrFilter } from './types'

export type PaginationBehaviorOptions = {
  limit: number
  debounceTime?: number
  skipUntil?: number
}

const throttleConfig: ThrottleConfig = {
  leading: true,
  trailing: true,
}

export class PaginationLimitSubject extends BehaviorSubject<NostrFilter> {
  private subject$ = new Subject<number | undefined>()
  private limit: number
  private debounceTime: number
  private skipUntil: number

  initialValue: NostrFilter

  constructor(filter: NostrFilter, options?: PaginationBehaviorOptions) {
    const limit = options?.limit || 50
    const initialValue = { ...filter, limit }

    super(createFilter(initialValue))

    this.limit = limit
    this.debounceTime = options?.debounceTime || 1200
    this.skipUntil = options?.skipUntil || 1000
    this.initialValue = initialValue

    this.subject$
      .pipe(skipUntil(timer(this.skipUntil)), throttleTime(this.debounceTime, undefined, throttleConfig))
      .subscribe((until) => {
        super.next({ ...this.value, limit: this.limit, until })
      })
  }

  get value() {
    return this.getValue()
  }

  get authors() {
    return this.value.authors || []
  }

  nextUntil(until: number) {
    this.subject$.next(until)
  }

  reset() {
    const { until, ...rest } = this.value
    super.next(createFilter(rest))
  }

  setLimit(limit: number) {
    this.limit = limit
  }

  setFilter(filter: NostrFilter) {
    super.next(createFilter({ ...this.value, ...filter }))
    return this
  }
}
