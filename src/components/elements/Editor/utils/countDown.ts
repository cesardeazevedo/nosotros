import { defer, timer, map, takeWhile, endWith, Subject } from 'rxjs'

export const cancel$ = new Subject<void>()

export const countDown$ = defer(() =>
  timer(0, 1000).pipe(
    map((i) => Math.max(0, 4 - i)),
    takeWhile((x) => x > 0, true),
    endWith(false),
  ),
)
