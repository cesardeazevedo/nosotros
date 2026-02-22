import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import type { NostrEvent } from 'nostr-tools'
import { connect, EMPTY, expand, identity, ignoreElements, merge, mergeMap, of, skip, tap } from 'rxjs'
import { batcherDep } from '../batchers'
import { setEventData } from '../query/queryUtils'
import { subscribeMediaStats } from './subscribeMediaStats'
import { subscribeStrategy } from './subscribeStrategy'

type QuoteOptions = {
  depth?: number
}

type Options = {
  quotes?: QuoteOptions
}

const DEFAULT_MAX_DEPTH = 8

const subscribeIds = (ctx: NostrContext, ids: string[], relayHints?: NostrContext['relayHints']) => {
  if (!ids.length) {
    return EMPTY
  }
  const depsCtx = {
    ...ctx,
    network: 'CACHE_FIRST_BATCH',
    subId: 'deps',
    relayHints,
    batcher: batcherDep,
  } as NostrContext

  return of(ids).pipe(
    mergeMap((ids) => {
      return subscribeStrategy(depsCtx, { ids }).pipe(
        tap((res) => {
          // res.forEach(x => console.log('EVENT', x))
          res.forEach(setEventData)
        }),
        subscribeMediaStats(),
        mergeMap(identity),
      )
    }),
  )
}

const subscribeQuotes = (ctx: NostrContext, options?: QuoteOptions) => {
  return mergeMap((event: NostrEventDB) => {
    return of(event).pipe(
      expand((event, depth) => {
        if (depth >= (options?.depth || DEFAULT_MAX_DEPTH)) {
          return EMPTY
        }
        const mentions = event.metadata?.mentionedNotes || []
        const ids = dedupe(mentions)
        return subscribeIds(ctx, ids, event.metadata?.relayHints)
      }),
      skip(1)
    )
  })
}

const subscribeRepost = (ctx: NostrContext) => {
  return mergeMap((event: NostrEventDB) => {
    if (event.kind !== Kind.Repost) {
      return EMPTY
    }
    const eTag = event.tags.find((tag) => tag[0] === 'e')?.[1]
    let parsedId
    try {
      parsedId = (JSON.parse(event.content || '{}') as NostrEvent)?.id
    } catch {
      parsedId = undefined
    }
    // console.log('REPOST DEP', event, parsedId)
    const repostId = eTag || parsedId
    const isRepost = event.kind === Kind.Repost
    const ids = dedupe(repostId ? [repostId] : undefined).filter(Boolean)
    const repost$ = subscribeIds(ctx, ids, event.metadata?.relayHints)
    return isRepost ? repost$ : EMPTY
  })
}

const subscribeParents = (ctx: NostrContext) => {
  return mergeMap((event: NostrEventDB) => {
    const { rootId, parentId } = event.metadata || {}
    const ids = dedupe([rootId, parentId])
    if (ids.length) {
      return subscribeIds(ctx, ids, event.metadata?.relayHints)
    }
    return EMPTY
  })
}

export function subscribeDependencies(ctx: NostrContext, options?: Options) {
  return mergeMap((events: NostrEventDB[]) => {
    return of(events).pipe(
      connect((events$) => {
        const event$ = events$.pipe(mergeMap(identity))
        return merge(
          events$.pipe(subscribeMediaStats()),
          event$.pipe(subscribeQuotes(ctx, options?.quotes), ignoreElements()),
          event$.pipe(subscribeRepost(ctx), ignoreElements()),
          event$.pipe(subscribeParents(ctx), ignoreElements()),
        )
      })
    )
  })
}
