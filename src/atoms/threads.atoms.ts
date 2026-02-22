import { FALLBACK_RELAYS } from '@/constants/relays'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions } from '@/hooks/query/useQueryBase'
import type { InfiniteEvents } from '@/hooks/query/useQueryFeeds'
import { atom, type Getter } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'

type ParentSelected = NostrEventDB | undefined

const parentEventQueryAtomFamily = atomFamily(
  (params: { parentId: string; childEvent: NostrEventDB }) => {
    return atomWithQuery<NostrEventDB[], Error, ParentSelected>(() => {
      const { parentId, childEvent } = params
      return eventQueryOptions<ParentSelected>({
        queryKey: queryKeys.event(parentId),
        filter: { ids: [parentId] },
        enabled: parentId.length > 0,
        select: (events) => events[0],
        ctx: {
          relays: FALLBACK_RELAYS,
          relayHints: mergeRelayHints([
            { ids: { [parentId]: FALLBACK_RELAYS } },
            childEvent.metadata?.relayHints ?? {},
          ]),
        },
      })
    })
  },
  (a, b) => a.parentId === b.parentId && a.childEvent.id === b.childEvent.id,
)

const resolveEventThread = (get: Getter, event: NostrEventDB) => {
  const collected: NostrEventDB[] = []
  const visitedIds = new Set<string>()

  let current: NostrEventDB | undefined = event

  while (current) {
    if (visitedIds.has(current.id)) {
      break
    }

    visitedIds.add(current.id)
    collected.push(current)

    const parentId: string | undefined = current.metadata?.parentId
    if (!parentId) {
      break
    }

    const parent: ParentSelected = get(
      parentEventQueryAtomFamily({
        parentId,
        childEvent: current,
      }),
    ).data

    if (!parent) {
      break
    }

    current = parent
  }

  return collected.reverse()
}

export type ThreadBranchItem =
  | { type: 'parent'; eventId: string }
  | { type: 'reply'; eventId: string; hasChildren: boolean }
  | { type: 'summary'; eventIds: string[] }

export type ThreadBranch = {
  items: ThreadBranchItem[]
}

export type ThreadGroup = {
  rootId: string
  branches: ThreadBranch[]
}

const COLLAPSE_THRESHOLD = 4

type Segment = {
  parentIds: string[] // non-feed events before this feed reply (last one = immediate parent)
  replyId: string     // feed reply
}

export function buildBranches(replies: { replyId: string; chainIds: string[] }[]): ThreadBranch[] {
  const repliesByHeadId = new Map<string, { replyId: string; chainIds: string[] }[]>()
  const headOrder: string[] = []

  for (const reply of replies) {
    const headId = reply.chainIds[0]
    if (!headId) {
      continue
    }

    if (!repliesByHeadId.has(headId)) {
      repliesByHeadId.set(headId, [])
      headOrder.push(headId)
    }

    repliesByHeadId.get(headId)!.push(reply)
  }

  const branches: ThreadBranch[] = []

  for (const headId of headOrder) {
    const headReplies = repliesByHeadId.get(headId) || []
    if (headReplies.length === 0) {
      continue
    }

    let primaryChain = headReplies[0].chainIds
    for (const reply of headReplies) {
      if (reply.chainIds.length >= primaryChain.length) {
        primaryChain = reply.chainIds
      }
    }

    const primaryIndexById = new Map<string, number>()
    primaryChain.forEach((eventId, index) => {
      primaryIndexById.set(eventId, index)
    })

    const selectedOnPrimary: { replyId: string; index: number }[] = []
    const selectedIds = new Set<string>()

    for (const reply of headReplies) {
      const selectedIndex = primaryIndexById.get(reply.replyId)
      if (selectedIndex === undefined) {
        continue
      }
      if (reply.chainIds.length !== selectedIndex + 1) {
        continue
      }

      let isPrefix = true
      for (let i = 0; i < reply.chainIds.length; i++) {
        if (reply.chainIds[i] !== primaryChain[i]) {
          isPrefix = false
          break
        }
      }
      if (!isPrefix) {
        continue
      }

      if (!selectedIds.has(reply.replyId)) {
        selectedIds.add(reply.replyId)
        selectedOnPrimary.push({ replyId: reply.replyId, index: selectedIndex })
      }
    }

    selectedOnPrimary.sort((a, b) => a.index - b.index)

    const segments: Segment[] = []
    let previousReplyIndex = -1

    for (const selected of selectedOnPrimary) {
      const parentIds = primaryChain.slice(previousReplyIndex + 1, selected.index)
      segments.push({ parentIds, replyId: selected.replyId })
      previousReplyIndex = selected.index
    }

    if (segments.length > 0) {
      branches.push({ items: segmentsToItems(segments) })
    }
  }

  return branches
}

function segmentsToItems(segments: Segment[]): ThreadBranchItem[] {
  if (segments.length <= 2) {
    return expandSegments(segments)
  }

  // Count visible events if fully expanded
  let visibleCount = 0
  for (const seg of segments) {
    visibleCount += (seg.parentIds.length > 0 ? 1 : 0) + 1 // immediate parent + reply
  }

  if (visibleCount <= COLLAPSE_THRESHOLD) {
    return expandSegments(segments)
  }

  // Collapse: keep first and last segment, hide middle
  const first = segments[0]
  const last = segments[segments.length - 1]
  const middleSegments = segments.slice(1, -1)

  // Hidden events: all events in middle segments + hidden parents from last segment (all but the last parent)
  const hiddenEventIds: string[] = []
  for (const seg of middleSegments) {
    hiddenEventIds.push(...seg.parentIds)
    hiddenEventIds.push(seg.replyId)
  }
  // Last segment's parentIds except the last one (immediate parent shown)
  if (last.parentIds.length > 1) {
    hiddenEventIds.push(...last.parentIds.slice(0, -1))
  }

  const items: ThreadBranchItem[] = []
  // First segment
  addSegmentItems(items, first, true)
  // Summary
  if (hiddenEventIds.length > 0) {
    items.push({ type: 'summary', eventIds: hiddenEventIds })
  }
  // Last segment — only keep immediate parent (rest already in hidden summary)
  const collapsedLast: Segment = {
    parentIds: last.parentIds.length > 0 ? [last.parentIds[last.parentIds.length - 1]] : [],
    replyId: last.replyId,
  }
  addSegmentItems(items, collapsedLast, false, true)

  return items
}

function expandSegments(segments: Segment[]): ThreadBranchItem[] {
  const items: ThreadBranchItem[] = []
  for (let i = 0; i < segments.length; i++) {
    const isLast = i === segments.length - 1
    addSegmentItems(items, segments[i], !isLast || segments.length === 1, isLast)
  }
  return items
}

function addSegmentItems(items: ThreadBranchItem[], segment: Segment, hasChildren: boolean, isLastSegment?: boolean) {
  const { parentIds, replyId } = segment

  if (parentIds.length > 1) {
    // Summary for all parents except the immediate one (last)
    items.push({ type: 'summary', eventIds: parentIds.slice(0, -1) })
  }
  if (parentIds.length > 0) {
    items.push({ type: 'parent', eventId: parentIds[parentIds.length - 1] })
  }
  items.push({ type: 'reply', eventId: replyId, hasChildren: isLastSegment ? false : hasChildren })
}

export const threadGroupsAtomFamily = atomFamily(
  (params: InfiniteEvents) => {
    const groupedThreadsAtom = atom((get): ThreadGroup[][] => {
      const groupedPages: ThreadGroup[][] = []
      const globalGroupById = new Map<string, { rootId: string; replies: { replyId: string; chainIds: string[] }[] }>()
      const seenEventIds = new Set<string>()

      for (const page of params.pages) {
        const groupsInOrder: ThreadGroup[] = []
        const newRootIds: string[] = []

        for (const event of page) {
          // console.log('>', event)
          if (seenEventIds.has(event.id)) {
            continue
          }
          seenEventIds.add(event.id)

          // Group by rootId from tags — immediate, no loading needed
          const rootId = event.metadata?.rootId || event.id

          // Trigger parent chain loading (side effect)
          const chain = resolveEventThread(get, event)

          // Build the ID chain between root and reply (exclusive of root)
          // chain = [loaded_ancestor, ..., event] — may be incomplete
          const chainIds = chain.map((e) => e.id)

          // If chain didn't reach root, fill in known parent IDs from metadata
          const firstLoaded = chain[0]
          if (firstLoaded && !chainIds.includes(rootId)) {
            let parentId = firstLoaded.metadata?.parentId
            while (parentId && parentId !== rootId && !chainIds.includes(parentId)) {
              chainIds.unshift(parentId)
              parentId = undefined // we only know one level from metadata
            }
          }

          const rootIndex = chainIds.indexOf(rootId)
          // Slice from after root to end (the intermediates + reply)
          const pathIds = rootIndex >= 0 ? chainIds.slice(rootIndex + 1) : chainIds

          let group = globalGroupById.get(rootId)
          if (!group) {
            group = { rootId, replies: [] }
            globalGroupById.set(rootId, group)
            newRootIds.push(rootId)
          }

          if (event.id !== rootId && pathIds.length > 0) {
            group.replies.push({ replyId: event.id, chainIds: pathIds })
          }
        }

        for (const rootId of newRootIds) {
          const group = globalGroupById.get(rootId)!
          groupsInOrder.push({
            rootId: group.rootId,
            branches: buildBranches(group.replies),
          })
        }

        groupedPages.push(groupsInOrder)
      }

      // Rebuild trees for groups that got new replies from later pages
      for (const page of groupedPages) {
        for (const group of page) {
          const raw = globalGroupById.get(group.rootId)!
          group.branches = buildBranches(raw.replies)
        }
      }

      return groupedPages
    })

    return groupedThreadsAtom
  },
  (a, b) => {
    const aEvents = a.pages.flat()
    const bEvents = b.pages.flat()
    return aEvents.length === bEvents.length && aEvents[aEvents.length - 1]?.id === bEvents[bEvents.length - 1]?.id
  },
)
