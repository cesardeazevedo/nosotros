import { shareReplay, type Observable } from 'rxjs'

export class ShareReplayCache<T> {
  cache = new Map<string, Observable<T>>()

  clear() {
    this.cache.clear()
  }

  invalidate(value: string) {
    this.cache.delete(value)
  }

  wrap<P>(target: (...args: [string, ...P[]]) => Observable<T>) {
    return (...args: [string, ...P[]]) => {
      const cached = this.cache.get(args[0])
      if (cached) {
        return cached
      }
      const $ = target(...args).pipe(shareReplay(1))
      this.cache.set(args[0], $)
      return $
    }
  }
}
