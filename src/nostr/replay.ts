import { shareReplay, type Observable } from 'rxjs'

export class ShareReplayCache<T> {
  cache = new Map<string, Observable<T>>()

  clear() {
    this.cache.clear()
  }

  invalidate(value: string) {
    this.cache.delete(value)
  }

  wrap<P extends [string, ...unknown[]]>(target: (...args: P) => Observable<T>) {
    return (...args: P) => {
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
