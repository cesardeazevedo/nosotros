import { publishFollowList } from '@/nostr/publish/publishFollowList'
import type { Account } from '@/stores/auth/account.store'
import { useObservableState } from 'observable-hooks'
import { catchError, map, mergeMap, of, startWith } from 'rxjs'

export function useFollowSubmit(pubkeys: string[]) {
  return useObservableState<boolean, Account>((input$) => {
    return input$.pipe(
      mergeMap((acc) => {
        if (acc.signer) {
          return publishFollowList(acc.pubkey, 'p', pubkeys, { signer: acc.signer?.signer }).pipe(
            map(() => false),
            catchError(() => of(false)),
            startWith(true),
          )
        }
        throw new Error('Not authenticated')
      }),
    )
  }, false)
}
