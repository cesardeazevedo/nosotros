import type { PaginationSubject } from '@/core/PaginationSubject'
import { mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { subscribeNotifications } from './subscribeNotifications'

export function subscribeFeedInbox(filter$: PaginationSubject, ctx: NostrContext) {
  return filter$.$.pipe(mergeMap((filter) => subscribeNotifications(filter, ctx)))
}
