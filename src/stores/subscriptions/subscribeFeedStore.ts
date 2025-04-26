import { pickBy } from '@/core/helpers/pickBy'
import type { PaginationSubject } from '@/core/PaginationSubject'
import type { NostrContext } from '@/nostr/context'
import { subscribeFeedFollowing } from '@/nostr/subscriptions/subscribeFeedFollowing'
import { subscribeFeedFollowSet } from '@/nostr/subscriptions/subscribeFeedFollowSet'
import { subscribeFeedInbox } from '@/nostr/subscriptions/subscribeFeedInbox'
import { subscribeFeedSelf } from '@/nostr/subscriptions/subscribeFeedSelf'
import type { NostrEventMetadata } from '@/nostr/types'
import { matchFilter } from 'nostr-tools'
import { identity } from 'observable-hooks'
import { EMPTY, bufferTime, filter, finalize, map, merge, mergeMap, mergeWith, switchMap, tap } from 'rxjs'
import { createContextAuthenticator } from '../auth/authenticator'
import type { FeedStore } from '../feeds/feed.store'
import { toStream } from '../helpers/toStream'
import { rootStore } from '../root.store'

function subscribeFeedScope(feed: FeedStore, ctx: NostrContext, pagination: PaginationSubject) {
  const { scope, options } = feed
  switch (scope) {
    case 'self': {
      return subscribeFeedSelf(pagination, ctx, options)
    }
    case 'following': {
      return subscribeFeedFollowing(pagination, ctx, options)
    }
    case 'followset': {
      return subscribeFeedFollowSet(pagination, ctx, options)
    }
    case 'inbox': {
      return subscribeFeedInbox(pagination, ctx)
    }
    case 'relayfeed': {
      // In the future we will have to handle this differently for algo-relays
      return subscribeFeedSelf(pagination, ctx, options)
    }
    case 'followers':
    case 'wot':
    case 'network':
    case 'global': {
      return EMPTY // todo
    }
  }
}

type Options = {
  live?: boolean
  buffer?: number
}

export function subscribeFeedStore(feed: FeedStore, options?: Options) {
  const ctx = { ...rootStore.globalContext, ...feed.context }
  return toStream(() => ({ snap: feed.snapshot, feed })).pipe(
    mergeWith(createContextAuthenticator(ctx)),

    switchMap(({ feed }) => {
      feed.pagination.setFilter(feed.filter)
      feed.paginationLive.setFilter(feed.filter)
      return merge(
        subscribeFeedScope(feed, ctx, feed.pagination),
        options?.live !== false
          ? subscribeFeedScope(feed, { ...ctx, batcher: 'live' }, feed.paginationLive).pipe(
            filter((event) => matchFilter(pickBy(feed.paginationLive.filter, ['kinds', 'since']), event)),
            bufferTime(1500),
            mergeMap(identity),
            tap((item) => feed.addBuffer(item as NostrEventMetadata)),
            mergeMap(() => EMPTY),
          )
          : EMPTY,
      ).pipe(
        // trigger pagination if the feed.notes still empty
        mergeWith(feed.pagination.paginateIfEmpty(feed.notes)),

        bufferTime(options?.buffer || 600),

        filter((x) => x.length > 0),

        map((x) => x.toSorted((a, b) => (a.created_at > b.created_at ? -1 : 1))),

        tap((items) => {
          items.forEach((item) => feed.add(item as NostrEventMetadata))
        }),

        // Scope changed, reset the feed
        finalize(() => {
          feed.reset()
          feed.pagination.reset()
        }),
      )
    }),
  )
}

export function startFeedStream(module: { feed: FeedStore }) {
  return toStream(() => module.feed).pipe(switchMap((feed) => subscribeFeedStore(feed)))
}
