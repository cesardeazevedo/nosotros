import { bufferTime, filter, Subject, tap } from 'rxjs'

export class InsertBatcher<T> {
  queue: Subject<T>

  constructor(onBatch: (data: T[]) => void, batchTime = 500) {
    this.queue = new Subject<T>()
    this.queue
      .pipe(
        bufferTime(batchTime),
        filter((data) => data.length > 0),
        tap((data) => onBatch(data)),
      )
      .subscribe()
  }

  next(data: T) {
    this.queue.next(data)
  }
}
