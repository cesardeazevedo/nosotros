import { Kind } from '@/constants/kinds'
import { TOPIC_RELAYS } from '@/constants/relays'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { dedupeById } from '@/utils/utils'
import { combineLatest, from, identity, map, mergeMap, mergeWith, share, skip, take } from 'rxjs'
import { isAuthorTag, isTopicTag } from '../parsers/parseTags'
import { queryClient } from '../query/queryClient'
import { replaceableEventQueryOptions } from '../query/useQueryBase'
import { subscribeStrategy } from './subscribeStrategy'

export async function subscribeFollows(pubkey: string) {
  return await queryClient.fetchQuery(replaceableEventQueryOptions(Kind.Follows, pubkey))
}

export function subscribeFeedFollowing(ctx: NostrContext, filter: NostrFilter) {
  return from(filter.authors || []).pipe(
    mergeMap((author) => subscribeFollows(author)),
    mergeMap(identity),
    mergeMap((event) => {
      const { authors: _, ...rest } = filter
      const authors = [event.pubkey, ...event.tags.filter(isAuthorTag).map((x) => x[1])]
      const topics = event.tags.filter(isTopicTag).map((x) => x[1])
      const notes$ = subscribeStrategy(ctx, { ...rest, authors }).pipe(share())
      const topics$ = subscribeStrategy(
        { ...ctx, relays: TOPIC_RELAYS, subId: 'topics_' + ctx.subId },
        { ...rest, '#t': topics },
      ).pipe(share())
      return combineLatest([notes$.pipe(take(1)), topics$.pipe(take(1))]).pipe(
        mergeWith(notes$.pipe(skip(1))),
        mergeWith(topics$.pipe(skip(1))),
        map((data) => {
          return dedupeById(data.flat())
            .flat()
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, filter.limit)
        }),
      )
    }),
  )
}
