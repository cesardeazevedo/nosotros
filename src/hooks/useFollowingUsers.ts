import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import { toStream } from '@/stores/helpers/toStream'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { identity, pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { bufferTime, filter, map, mergeMap, take } from 'rxjs'
import { useCurrentUser, useRootContext } from './useRootStore'

export function useFollowingUsers() {
  const user = useCurrentUser()
  const context = useRootContext()
  const sub = useObservable(
    (user$) => {
      return user$.pipe(
        pluckFirst,
        mergeMap((user) => toStream(() => user?.followsEvent?.event.tags || [])),
        mergeMap(identity),
        filter(([tag]) => tag === 'p'),
        mergeMap(([, pubkey]) => subscribeUser(pubkey, context)),
        map((event) => userStore.get(event.pubkey)),
        filter((x) => !!x),
        bufferTime<User>(1000),
        filter((x) => x.length > 0),
        take(1),
      )
    },
    [user],
  )
  const [users] = useObservableState(() => sub, [] as User[])
  return users as User[]
}
