import { useRootContext } from '@/hooks/useRootStore'
import { publishRelayList } from '@/nostr/publish/publishRelayList'
import type { UserRelay } from '@/nostr/types'
import { useObservableState } from 'observable-hooks'
import { catchError, last, map, mergeMap, of, startWith } from 'rxjs'

export function usePublishRelayList() {
  const rootContext = useRootContext()
  return useObservableState<boolean, [UserRelay, boolean]>((input$) => {
    return input$.pipe(
      mergeMap(([userRelay, revoke]) => {
        return publishRelayList(rootContext.context, userRelay, revoke).pipe(
          last(),
          map(() => false),
          catchError(() => of(false)),
          startWith(true),
        )
      }),
    )
  }, false)
}
