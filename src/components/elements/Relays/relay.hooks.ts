import { useCurrentSigner } from '@/hooks/useRootStore'
import { publishRelayList } from '@/nostr/publish/publishRelayList'
import type { UserRelay } from '@/nostr/types'
import { useObservableState } from 'observable-hooks'
import { catchError, last, map, mergeMap, of, startWith } from 'rxjs'

export function usePublishRelayList() {
  const signer = useCurrentSigner()
  return useObservableState<boolean, [UserRelay, revoke: boolean]>((input$) => {
    return input$.pipe(
      mergeMap(([userRelay, revoke]) => {
        return publishRelayList(userRelay, revoke, { signer }).pipe(
          last(),
          map(() => false),
          catchError(() => of(false)),
          startWith(true),
        )
      }),
    )
  }, false)
}
