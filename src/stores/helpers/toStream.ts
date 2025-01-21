import { reaction } from 'mobx'
import { Observable } from 'rxjs'

export const toStream = <T>(fn: () => T) => {
  return new Observable<T>((observer) => {
    const dispose = reaction(
      () => fn(),
      (value) => {
        observer.next(value)
      },
      {
        fireImmediately: true,
      },
    )
    return () => dispose()
  })
}
