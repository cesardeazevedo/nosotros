import { Kind } from '@/constants/kinds'
import { STORAGE_MODULES } from '@/constants/storage'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import type { Modules } from '@/hooks/modules/module'
import { queryKeys } from '@/hooks/query/queryKeys'
import { createFeedQueryOptions, type FeedModule, type InfiniteEvents } from '@/hooks/query/useQueryFeeds'
import { strictDeepEqual } from 'fast-equals'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithInfiniteQuery } from 'jotai-tanstack-query'
import { atomWithStorage } from 'jotai/utils'
import { selectedPubkeyAtom } from './auth.atoms'
import { threadGroupsAtomFamily } from './threads.atoms'
import { userFamily } from './users.atoms'

export type FeedAtoms =
  | ReturnType<typeof createFeedAtoms>
  | ReturnType<typeof createMediaFeedAtoms>
  | ReturnType<typeof createNotificationFeedAtoms>

export const persistentFeedStatesAtom = atomWithStorage<Record<string, Modules>>(STORAGE_MODULES, {}, undefined, {
  getOnInit: true,
})

export const sessionFeedStatesAtom = atom<Record<string, Modules>>({})

export function createModuleAtoms<T extends Modules>(options: T) {
  const id = options.id

  const sessionStateAtom = atom(
    (get) => {
      const sessionState = get(sessionFeedStatesAtom)[id]
      const persistentState = get(persistentFeedStatesAtom)[id]

      if (sessionState) {
        return sessionState as T
      }

      const merged = {
        ...options,
        ...persistentState,
      } as T

      return {
        ...merged,
        ctx: {
          ...options.ctx,
          ...persistentState?.ctx,
        },
      } as T
    },
    (get, set, updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      const currentState = get(sessionStateAtom)
      const allStates = get(sessionFeedStatesAtom)
      const newState = typeof updates === 'function' ? updates(currentState) : updates
      set(sessionFeedStatesAtom, {
        ...allStates,
        [id]: { ...currentState, ...newState } as T,
      })
    },
  )

  const filter = focusAtom(sessionStateAtom, (opts) => opts.prop('filter'))

  return {
    atom: sessionStateAtom,
    filter,
    options,
  }
}

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

  const query = atomWithInfiniteQuery((get) => {
    const sessionOptions = get(baseAtoms.atom)
    const currentPubkey = get(selectedPubkeyAtom)
    const currentUser = currentPubkey ? get(userFamily({ pubkey: currentPubkey, fullUserSync: true })) : undefined
    const queryKey = queryKeys.feed(sessionOptions.id, sessionOptions.filter, sessionOptions.ctx)
    const replies = sessionOptions.includeReplies
    const includeMuted = sessionOptions.includeMuted
    const includeMentions = (sessionOptions as { includeMentions?: boolean }).includeMentions
    const isInbox = sessionOptions.type === 'inbox'
    const isReplyKind = (kind: number) => kind === Kind.Text || kind === Kind.Comment || kind === Kind.PublicMessage
    const isMutedEvent = (event: { id: string; pubkey: string }) => {
      if (!currentUser) return false
      return !!currentUser.mutedNotes?.has(event.id) || !!currentUser.mutedAuthors?.has(event.pubkey)
    }

    return createFeedQueryOptions({
      ...sessionOptions,
      queryKey,
      select: (data: InfiniteEvents) => {
        if (isInbox) {
          return {
            pages: data.pages.map((page) =>
              page.filter((event) => {
                if (includeMuted === false && isMutedEvent(event)) {
                  return false
                }
                if (replies === false && isReplyKind(event.kind) && !event.metadata?.isRoot) {
                  return false
                }
                if (includeMentions === false && isReplyKind(event.kind) && !!event.metadata?.isRoot) {
                  return false
                }
                return true
              }),
            ),
            pageParams: data.pageParams,
          }
        }

        const pages = data.pages.flat().filter((event) => {
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

  // Some feed options are updated from url parameters instead of setting the atom directly.
  // This set atom keeps it in sync with the current module, only if the persistent state isn't present.
  const sync = atom(null, (get, set, newOptions: T) => {
    const persistentState = get(persistentFeedStatesAtom)[options.id] as T
    const updates = {} as Partial<T>

    if (!persistentState?.filter) {
      updates.filter = newOptions.filter
    }
    if (!persistentState?.includeReplies) {
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
    buffer,
    bufferReplies,
    isDirty,
    isModified,
    save,
    reset,
    sync,
  }
}

export function createNotificationFeedAtoms(options: NotificationFeedModule) {
  const feedAtoms = createFeedAtoms(options)
  const includeMentions = focusAtom(feedAtoms.atom, (optic) => optic.prop('includeMentions'))
  return {
    ...feedAtoms,
    includeMentions,
  }
}

export function createMediaFeedAtoms(options: MediaFeedModule) {
  const feedAtoms = createFeedAtoms(options)
  const layout = focusAtom(feedAtoms.atom, (optic) => optic.prop('layout'))
  const isDirty = atom((get) => {
    return get(feedAtoms.isDirty) || get(feedAtoms.originalState).layout !== get(feedAtoms.atom).layout
  })
  const isModified = atom((get) => {
    const module = (get(persistentFeedStatesAtom)[options.id] || options) as MediaFeedModule
    return get(feedAtoms.isModified) || module.layout !== options.layout
  })
  return {
    ...feedAtoms,
    isDirty,
    isModified,
    layout,
  }
}
