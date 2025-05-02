import { dedupe } from '@/core/helpers/dedupe'
import { useFollowingUsers } from '@/hooks/useFollowingUsers'
import { useCurrentUser } from '@/hooks/useRootStore'
import { subscribeSearch } from '@/nostr/subscriptions/subscribeSearch'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { useMemo } from 'react'
import { debounceTime, map, mergeMap } from 'rxjs'

type SearchOptions = {
  query: string
  limit: number
  suggestQuery?: boolean
  // todo
  suggestRelays?: boolean
}

export type SearchItem =
  | { type: 'user'; pubkey: string }
  | { type: 'user_relay'; pubkey: string }
  | { type: 'query'; query: string }
  | { type: 'relay'; relay: string }

function useSearchRelays(options: SearchOptions) {
  const user = useCurrentUser()
  const query$ = useObservable(pluckFirst, [options.query])
  const [users] = useObservableState<User[]>(
    () =>
      query$.pipe(
        debounceTime(1000, undefined),
        mergeMap((query) => subscribeSearch(query, options.limit)),
        map((results) => results.sort((_, b) => (user?.followsPubkey(b.pubkey) ? 1 : -1))),
        map((events) => {
          return dedupe(events.map((x) => x.pubkey))
            .map((pubkey) => userStore.get(pubkey))
            .filter((x) => !!x)
        }),
      ),
    [],
  )
  return users
}

function useSearchFollowingUsers(options: SearchOptions) {
  const { query, limit } = options
  const users = useFollowingUsers()
  return useMemo(() => {
    let result = users as User[]
    if (query) {
      result = users.filter((user) => user?.event.content.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    }
    return result.slice(0, options.limit)
  }, [query, limit, users])
}

export function useSearchSuggestions(options: SearchOptions) {
  const usersRelay = useSearchRelays(options)
  const usersFollowing = useSearchFollowingUsers(options)
  const querySuggestion =
    options.suggestQuery !== false && options.query ? { type: 'query', query: options.query } : undefined
  const relaySuggestion =
    options.suggestRelays !== false && options.query
      ? {
          type: 'relay',
          relay:
            (options.query.startsWith('wss://') || options.query.startsWith('ws://') ? '' : 'wss://') + options.query,
        }
      : undefined
  return [
    querySuggestion,
    relaySuggestion,
    ...usersFollowing.map((x) => ({ type: 'user' as const, pubkey: x.pubkey })),
    ...usersRelay.map((x) => ({ type: 'user_relay' as const, pubkey: x.pubkey })),
  ].filter((x) => !!x) as SearchItem[]
}
