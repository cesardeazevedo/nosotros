import type { Kind } from '@/constants/kinds'
import { subscribeSync } from '@/nostr/subscriptions/subscribeSync'
import { toStream } from '@/stores/helpers/toStream'
import { useObservable, useSubscription } from 'observable-hooks'
import { filter, mergeMap } from 'rxjs'
import { useRootStore } from './useRootStore'

export function useNostrSync(pubkey: string | undefined, kinds?: Kind[]) {
  const rootStore = useRootStore()
  const sub = useObservable(() => {
    return toStream(() => pubkey).pipe(
      filter((x): x is string => !!x),
      mergeMap((pubkey) => subscribeSync(pubkey, kinds, rootStore.globalContext)),
    )
  }, [])
  useSubscription(sub)
}
