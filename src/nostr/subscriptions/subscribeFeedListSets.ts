import { Kind } from '@/constants/kinds'
import type { PaginationSubject } from '@/core/PaginationSubject'
import { mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { WRITE } from '../types'
import { subscribe } from './subscribe'
import type { FeedOptions } from './subscribeFeed'
import { subscribeFeed } from './subscribeFeed'

export function subscribeFeedListSetsP(filter$: PaginationSubject, ctx: NostrContext, options?: FeedOptions) {
  const pubkey = filter$.value.authors?.[0]
  const listKind = filter$.value.kinds?.[0] || Kind.FollowSets
  return subscribe({ ...filter$.value, kinds: [listKind] }, { ...ctx, queryDB: true, pubkey, permission: WRITE }).pipe(
    mergeMap((event) => {
      const pTags = event.tags.filter((x) => x[0] === 'p').map((x) => x[1]) || []
      return filter$.setFilter({ authors: [event.pubkey, ...pTags] })
    }),
    mergeMap((filter) => {
      const { '#d': d, kinds: allKinds, ...rest } = filter
      const [, ...kinds] = allKinds || []
      return subscribeFeed({ ...rest, kinds }, ctx, options)
    }),
  )
}

export function subscribeFeedListSetsE(filter$: PaginationSubject, ctx: NostrContext) {
  const pubkey = filter$.value.authors?.[0]
  const listKind = filter$.value.kinds?.[0] || Kind.BookmarkList
  return subscribe({ ...filter$.value, kinds: [listKind] }, { ...ctx, queryDB: true, pubkey, permission: WRITE }).pipe(
    mergeMap((event) => {
      const ids = event.tags.filter((x) => x[0] === 'e').map((x) => x[1]) || []
      return filter$.setFilter({ ids })
    }),
    mergeMap((filter) => {
      return subscribe(
        { ids: filter.ids },
        {
          ...ctx,
          relays: ['wss://relay.nostr.band'],
        },
      )
    }),
  )
}
