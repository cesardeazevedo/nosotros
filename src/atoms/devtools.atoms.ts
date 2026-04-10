import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import { atom } from 'jotai'

export type DevtoolsFilterStats = {
  kinds?: number[]
  authors?: string[]
  ids?: number
  e?: number
  p?: string[]
  t?: string[]
  a?: number
  q?: number
  d?: number
  k?: number
  since?: number
  until?: number
  limit?: number
  search?: string
}

export type DevtoolsChildSubscription = {
  id: string
  relay: string
  subscriptionId: string
  filter: DevtoolsFilterStats
  state: 'open' | 'closed'
  isNegentropy: boolean
  negErrorMessage?: string
  localEventsSelected: number
  negMissingIds: number
  eventCount: number
  eventsByKind: Record<number, number>
  createdAt: number
}

export type DevtoolsSubscriptionGroup = {
  id: string
  createdAt: number
  state: 'idle' | 'open' | 'closed'
  ctx: NostrContext
  filter: DevtoolsFilterStats
  cacheQueriedEvents: number
  children: DevtoolsChildSubscription[]
}

const count = (value: unknown): number | undefined => {
  if (Array.isArray(value)) return value.length
  return undefined
}

const createFilterStats = (filter: NostrFilter): DevtoolsFilterStats => ({
  kinds: filter.kinds,
  authors: Array.isArray(filter.authors) ? filter.authors : undefined,
  ids: count(filter.ids),
  e: count(filter['#e']),
  p: Array.isArray(filter['#p']) ? filter['#p'] : undefined,
  t: Array.isArray(filter['#t']) ? filter['#t'] : undefined,
  a: count(filter['#a']),
  q: count(filter['#q']),
  d: count(filter['#d']),
  k: count(filter['#k']),
  since: filter.since,
  until: filter.until,
  limit: filter.limit,
  search: filter.search,
})

let groupSequence = 0

const createGroupId = (ctx: NostrContext, filter: NostrFilter) => {
  const subId = ctx.subId || 'unknown'
  const kinds = (filter.kinds || []).join(',')
  groupSequence += 1
  return `${subId}:${Date.now()}:${kinds}:${groupSequence}`
}

const withGroupState = (group: DevtoolsSubscriptionGroup): DevtoolsSubscriptionGroup => {
  if (!group.children.length) {
    return group
  }
  const closed = group.children.every((child) => child.state === 'closed')
  return closed ? { ...group, state: 'closed' } : { ...group, state: 'open' }
}

export const devtoolsSubscriptionGroupsAtom = atom<DevtoolsSubscriptionGroup[]>([])

export const addSubscriptionGroupAtom = atom(
  null,
  (get, set, payload: { ctx: NostrContext; filter: NostrFilter }): string => {
    const queryKey = Array.isArray(payload.ctx.queryKey) ? [...payload.ctx.queryKey] : payload.ctx.queryKey
    const id = payload.ctx.subscriptionGroupId || createGroupId(payload.ctx, payload.filter)
    const existing = get(devtoolsSubscriptionGroupsAtom).find((group) => group.id === id)
    if (existing) {
      return id
    }
    const next: DevtoolsSubscriptionGroup = {
      id,
      createdAt: Date.now(),
      state: 'idle',
      ctx: {
        ...payload.ctx,
        queryKey,
        subscriptionGroupId: id,
      },
      filter: createFilterStats(payload.filter),
      cacheQueriedEvents: 0,
      children: [],
    }
    set(devtoolsSubscriptionGroupsAtom, [next, ...get(devtoolsSubscriptionGroupsAtom)])
    return id
  },
)

export const setSubscriptionGroupCacheQueriedAtom = atom(
  null,
  (get, set, payload: { groupId: string; count: number }) => {
    set(
      devtoolsSubscriptionGroupsAtom,
      get(devtoolsSubscriptionGroupsAtom).map((group) =>
        group.id === payload.groupId ? { ...group, cacheQueriedEvents: payload.count } : group,
      ),
    )
  },
)

export const addSubscriptionChildAtom = atom(
  null,
  (
    get,
    set,
    payload: { groupId: string; childId: string; relay: string; subscriptionId: string; filter: NostrFilter },
  ) => {
    const groups = get(devtoolsSubscriptionGroupsAtom)
    set(
      devtoolsSubscriptionGroupsAtom,
      groups.map((group) => {
        if (group.id !== payload.groupId) {
          return group
        }
        const exists = group.children.some((child) => child.id === payload.childId)
        if (exists) {
          return group
        }
        const child: DevtoolsChildSubscription = {
          id: payload.childId,
          relay: payload.relay,
          subscriptionId: payload.subscriptionId,
          filter: createFilterStats(payload.filter),
          state: 'open',
          isNegentropy: false,
          negErrorMessage: undefined,
          localEventsSelected: 0,
          negMissingIds: 0,
          eventCount: 0,
          eventsByKind: {},
          createdAt: Date.now(),
        }
        return {
          ...group,
          state: 'open',
          children: [...group.children, child],
        }
      }),
    )
  },
)

export const setSubscriptionChildNegErrorAtom = atom(
  null,
  (get, set, payload: { groupId: string; childId: string; negErrorMessage?: string }) => {
    set(
      devtoolsSubscriptionGroupsAtom,
      get(devtoolsSubscriptionGroupsAtom).map((group) => {
        if (group.id !== payload.groupId) {
          return group
        }
        return {
          ...group,
          children: group.children.map((child) =>
            child.id === payload.childId ? { ...child, negErrorMessage: payload.negErrorMessage } : child,
          ),
        }
      }),
    )
  },
)

export const addSubscriptionChildEventAtom = atom(
  null,
  (get, set, payload: { groupId: string; childId: string; kind: number }) => {
    set(
      devtoolsSubscriptionGroupsAtom,
      get(devtoolsSubscriptionGroupsAtom).map((group) => {
        if (group.id !== payload.groupId) {
          return group
        }
        return {
          ...group,
          children: group.children.map((child) =>
            child.id === payload.childId
              ? {
                  ...child,
                  eventCount: child.eventCount + 1,
                  eventsByKind: {
                    ...child.eventsByKind,
                    [payload.kind]: (child.eventsByKind[payload.kind] || 0) + 1,
                  },
                }
              : child,
          ),
        }
      }),
    )
  },
)

export const setSubscriptionChildNegentropyAtom = atom(
  null,
  (get, set, payload: { groupId: string; childId: string; localEventsSelected: number }) => {
    set(
      devtoolsSubscriptionGroupsAtom,
      get(devtoolsSubscriptionGroupsAtom).map((group) => {
        if (group.id !== payload.groupId) {
          return group
        }
        return {
          ...group,
          children: group.children.map((child) =>
            child.id === payload.childId
              ? {
                  ...child,
                  isNegentropy: true,
                  localEventsSelected: payload.localEventsSelected,
                }
              : child,
          ),
        }
      }),
    )
  },
)

export const setSubscriptionChildNegMissingAtom = atom(
  null,
  (get, set, payload: { groupId: string; childId: string; negMissingIds: number }) => {
    set(
      devtoolsSubscriptionGroupsAtom,
      get(devtoolsSubscriptionGroupsAtom).map((group) => {
        if (group.id !== payload.groupId) {
          return group
        }
        return {
          ...group,
          children: group.children.map((child) =>
            child.id === payload.childId ? { ...child, negMissingIds: payload.negMissingIds } : child,
          ),
        }
      }),
    )
  },
)

export const updateSubscriptionChildStateAtom = atom(
  null,
  (get, set, payload: { groupId: string; childId: string; state: 'closed' }) => {
    set(
      devtoolsSubscriptionGroupsAtom,
      get(devtoolsSubscriptionGroupsAtom).map((group) => {
        if (group.id !== payload.groupId) {
          return group
        }
        const next = {
          ...group,
          children: group.children.map((child) =>
            child.id === payload.childId ? { ...child, state: payload.state } : child,
          ),
        }
        return withGroupState(next)
      }),
    )
  },
)

export const closeSubscriptionGroupAtom = atom(null, (get, set, id: string) => {
  set(
    devtoolsSubscriptionGroupsAtom,
    get(devtoolsSubscriptionGroupsAtom).map((group) => (group.id === id ? { ...group, state: 'closed' } : group)),
  )
})

export const clearDevtoolsSubscriptionsAtom = atom(null, (_get, set) => {
  set(devtoolsSubscriptionGroupsAtom, [])
})
