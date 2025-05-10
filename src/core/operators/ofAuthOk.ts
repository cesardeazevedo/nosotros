import type { Observable } from 'rxjs'
import { mergeMap, take } from 'rxjs'
import type { MessageReceived } from '../types'
import { ofAuth } from './ofAuth'
import { ofOk } from './ofOk'

export function ofAuthOk() {
  return (source: Observable<MessageReceived>) => {
    return source.pipe(
      ofAuth(),
      mergeMap(() => source.pipe(ofOk(), take(1))),
    )
  }
}
