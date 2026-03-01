import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { prependEventFeed } from '@/hooks/query/queryUtils'
import { createFeedQueryOptions, type FeedModule, type InfiniteEvents } from '@/hooks/query/useQueryFeeds'
import { strictDeepEqual } from 'fast-equals'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithInfiniteQuery } from 'jotai-tanstack-query'
import { selectedPubkeyAtom } from './auth.atoms'
import { createModuleAtoms, persistentFeedStatesAtom, sessionFeedStatesAtom } from './modules.atoms'
import { store } from './store'
import { threadGroupsAtomFamily } from './threads.atoms'
import { userFamily } from './users.atoms'

export function createFeedAtoms<T extends FeedModule>(options: T) {
  const baseAtoms = createModuleAtoms(options)

  const originalState = atom((get) => {
    return (get(persistentFeedStatesAtom)[options.id] as T | undefined) || options
  })

  const autoUpdate = focusAtom(baseAtoms.atom, (opts) => opts.prop('autoUpdate'))
  const pageSize = focusAtom(baseAtoms.atom, (optic) => optic.prop('pageSize'))
  const blured = focusAtom(baseAtoms.atom, (optic) => optic.prop('blured'))
  const buffer = focusAtom(baseAtoms.atom, (optic) => optic.prop('buffer'))
  const bufferReplies = focusAtom(baseAtoms.atom, (optic) => optic.prop('bufferReplies'))
  const includeReplies = focusAtom(baseAtoms.atom, (optic) => optic.prop('includeReplies'))
  const includeMuted = focusAtom(baseAtoms.atom, (optic) => optic.prop('includeMuted'))
  const onStream = atom(null, (get, set, event: NostrEventDB) => {
    const sessionOptions = get(baseAtoms.atom)
    const queryKey = queryKeys.feed(sessionOptions.id, sessionOptions.filter, sessionOptions.ctx)
    if (sessionOptions.autoUpdate) {
      prependEventFeed(queryKey, [event])
      return
    }

    if (event.metadata?.isRoot || event.kind !== Kind.Text) {
      set(buffer, (events) => [...(events || []), event])
    } else {
      set(bufferReplies, (events) => [...(events || []), event])
    }
  })

  const query = atomWithInfiniteQuery((get) => {
    const sessionOptions = get(baseAtoms.atom)
    const currentPubkey = get(selectedPubkeyAtom)
    const currentUser = currentPubkey ? get(userFamily({ pubkey: currentPubkey, fullUserSync: true })) : undefined
    const queryKey = queryKeys.feed(sessionOptions.id, sessionOptions.filter, sessionOptions.ctx)
    const replies = sessionOptions.includeReplies
    const includeMuted = sessionOptions.includeMuted
    const isInbox = sessionOptions.type === 'inbox'
    const filter =
      Array.isArray(sessionOptions.filter.kinds)
        ? { ...sessionOptions.filter, kinds: dedupe(sessionOptions.filter.kinds, [Kind.EventDeletion]) }
        : sessionOptions.filter
    const isMutedEvent = (event: { id: string; pubkey: string }) => {
      if (!currentUser) return false
      return !!currentUser.mutedNotes?.has(event.id) || !!currentUser.mutedAuthors?.has(event.pubkey)
    }

    return createFeedQueryOptions({
      ...sessionOptions,
      filter,
      queryKey,
      onStream: (event) => {
        store.set(onStream, event)
      },
      select: (data: InfiniteEvents) => {
        if (isInbox) {
          return {
            pages: data.pages.map((page) =>
              page.filter((event) => {
                if (event.kind === Kind.EventDeletion) {
                  return false
                }
                if (includeMuted === false && isMutedEvent(event)) {
                  return false
                }
                if (replies === false && !event.metadata?.isRoot) {
                  return false
                }
                return true
              }),
            ),
            pageParams: data.pageParams,
          }
        }

        const pages = data.pages.flat().filter((event) => {
          if (event.kind === Kind.EventDeletion) {
            return false
          }
          if (includeMuted === false && isMutedEvent(event)) {
            return false
          }
          switch (event.kind) {
            case Kind.Text: {
              if (replies !== undefined) {
                return replies ? !event.metadata?.isRoot : !!event.metadata?.isRoot
              }
              return true
            }
            case Kind.Repost: {
              return !replies
            }
            default: {
              return !replies
            }
          }
        })
        if (replies) {
          // TODO: group threads
          const threads = pages
          return {
            pages: [threads],
            pageParams: data.pageParams,
          }
        }
        return {
          pages: [pages],
          pageParams: data.pageParams,
        }
      },
    })
  })

  const data = atom((get) => {
    const queryResult = get(query)
    const data = queryResult.data
    if (!data?.pages) {
      return {
        pages: [],
        pageParams: [],
      }
    }

    const sessionOptions = get(baseAtoms.atom)
    if (sessionOptions.includeReplies && sessionOptions.type !== 'inbox') {
      return {
        pages: get(threadGroupsAtomFamily(data)),
        pageParams: data.pageParams,
      }
    }

    return {
      pages: data.pages,
      pageParams: data.pageParams,
    }
  })

  const save = atom(null, (get, set) => {
    const sessionState = get(baseAtoms.atom)
    const id = sessionState.id
    const allPersistent = get(persistentFeedStatesAtom)
    set(baseAtoms.atom, sessionState)
    const { buffer, bufferReplies, pageSize, live, ctx, staleTime, ...rest } = sessionState
    const persistedCtx = sessionState.type === 'relayfeed' ? { relays: sessionState.ctx.relays } : {}
    set(persistentFeedStatesAtom, {
      ...allPersistent,
      [id]: {
        ...rest,
        ctx: persistedCtx,
      },
    })
  })

  const reset = atom(null, (get, set) => {
    const id = options.id
    const allStates = get(sessionFeedStatesAtom)
    set(sessionFeedStatesAtom, {
      ...allStates,
      [id]: options,
    })
    const persistent = get(persistentFeedStatesAtom)
    set(persistentFeedStatesAtom, {
      ...persistent,
      [id]: options,
    })
  })

  const sync = atom(null, (get, set, newOptions: T) => {
    const persistentState = get(persistentFeedStatesAtom)[options.id] as T
    const updates = {} as Partial<T>

    if (!persistentState?.filter) {
      updates.filter = newOptions.filter
    }
    if (persistentState?.includeReplies !== newOptions.includeReplies) {
      updates.includeReplies = newOptions.includeReplies
    }

    if (Object.keys(updates).length > 0) {
      set(baseAtoms.atom, updates)
    }
  })

  const isEqual = (value: T, value2: T) => {
    return (
      strictDeepEqual(value?.filter.kinds?.toSorted(), value2.filter.kinds?.toSorted()) &&
      (value.blured ?? false) === (value2.blured ?? false) &&
      (value.autoUpdate ?? false) === (value2.autoUpdate ?? false)
    )
  }

  const isDirty = atom((get) => {
    return !isEqual(get(originalState), get(baseAtoms.atom))
  })

  const isModified = atom((get) => {
    const module = (get(persistentFeedStatesAtom)[options.id] || options) as T
    return !isEqual(module, options)
  })

  return {
    ...baseAtoms,
    query,
    data,
    originalState,
    autoUpdate,
    pageSize,
    blured,
    includeReplies,
    includeMuted,
    onStream,
    buffer,
    bufferReplies,
    isDirty,
    isModified,
    save,
    reset,
    sync,
  }
}
