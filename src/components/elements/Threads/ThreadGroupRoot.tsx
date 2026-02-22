import type { ThreadBranch, ThreadBranchItem, ThreadGroup } from '@/atoms/threads.atoms'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import type { SxProps } from '@/components/ui/types'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions, useEvent } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import { useQueries } from '@tanstack/react-query'
import React, { memo, useState } from 'react'
import { css } from 'react-strict-dom'
import { ThreadHorizontalDivider } from './ThreadHorizontalDivider'
import { ThreadItem } from './ThreadItem'
import { ThreadRoot } from './ThreadRoot'
import { ThreadLoading } from './ThreadRootLoading'
import { ThreadSummary } from './ThreadSummary'


const ThreadGroupRootLoaded = memo(function ThreadGroupRootLoaded(props: { event: NostrEventDB }) {
  const note = useNoteState(props.event, { repliesOpen: false, forceSync: true, contentOpen: false })
  return (
    <NoteProvider value={{ event: props.event }}>
      <ThreadRoot note={note} renderEditor />
    </NoteProvider>
  )
})

const BranchItem = memo(function BranchItem(props: { item: ThreadBranchItem }) {
  const { item } = props
  switch (item.type) {
    case 'parent':
      return <ParentItem eventId={item.eventId} />
    case 'reply':
      return <FeedReplyItem eventId={item.eventId} hasChildren={item.hasChildren} />
    case 'summary':
      return <ExpandableSummary eventIds={item.eventIds} />
  }
})

const ThreadBranches = memo(function ThreadBranches(props: { branches: ThreadBranch[] }) {
  return (
    <>
      {props.branches.map((branch, index) => {
        const lastReply = branch.items.findLast((item) => item.type === 'reply')
        const key = lastReply && 'eventId' in lastReply ? lastReply.eventId : index
        return (
          <React.Fragment key={key}>
            {index > 0 && <ThreadHorizontalDivider />}
            {branch.items.map((item, i) => (
              <BranchItem key={item.type === 'summary' ? `summary-${i}` : ('eventId' in item ? item.eventId : i)} item={item} />
            ))}
          </React.Fragment>
        )
      })}
    </>
  )
})

const ExpandableSummary = memo(function ExpandableSummary(props: { eventIds: string[] }) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <>
        {props.eventIds.map((id) => (
          <ParentItem key={id} eventId={id} />
        ))}
      </>
    )
  }

  return (
    <SummaryItem sx={styles.parentSummary} eventIds={props.eventIds} onExpand={() => setExpanded(true)} />
  )
})

const SummaryItem = memo(function SummaryItem(props: { sx?: SxProps, eventIds: string[]; onExpand: () => void }) {
  const hiddenEvents = useQueries({
    queries: props.eventIds.map((eventId) =>
      eventQueryOptions<NostrEventDB | undefined>({
        queryKey: queryKeys.event(eventId),
        filter: { ids: [eventId] },
        enabled: !!eventId,
        select: (events) => events[0],
        ctx: { relays: FALLBACK_RELAYS },
      }),
    ),
  })
  const { data: event } = useEvent(props.eventIds[0], { relays: FALLBACK_RELAYS })
  if (!event) {
    return <ThreadLoading />
  }

  const hiddenPubkeys = [...new Set(hiddenEvents.map((query) => query.data?.pubkey).filter(Boolean))] as string[]

  return (
    <SummaryItemLoaded
      sx={props.sx}
      event={event}
      count={props.eventIds.length}
      pubkeysOverride={hiddenPubkeys}
      onExpand={props.onExpand}
    />
  )
})

const SummaryItemLoaded = memo(function SummaryItemLoaded(props: {
  sx?: SxProps
  event: NostrEventDB
  count: number
  pubkeysOverride?: string[]
  onExpand: () => void
}) {
  const note = useNoteState(props.event, { repliesOpen: false, forceSync: true, contentOpen: false })
  return (
    <ThreadSummary
      note={note}
      mode='parents'
      count={props.count}
      pubkeysOverride={props.pubkeysOverride}
      renderThreadIcon
      onClick={props.onExpand}
      sx={props.sx}
    />
  )
})

const ParentItem = memo(function ParentItem(props: { eventId: string }) {
  const { data: event } = useEvent(props.eventId, { relays: FALLBACK_RELAYS })
  if (!event) {
    return <ThreadLoading />
  }
  return <ThreadGroupItemEvent event={event} />
})

const ThreadGroupItemEvent = memo(function ParentItemLoaded(props: { event: NostrEventDB, children?: React.ReactNode }) {
  const note = useNoteState(props.event, { repliesOpen: false, forceSync: true, contentOpen: false })
  return (
    <NoteProvider value={{ event: props.event }}>
      <ThreadItem
        note={note}
        renderEditor
        renderReplies={false}
        renderThreadIndicator
        forceThreadIndicator
      />
      {props.children}
    </NoteProvider>
  )
})

const FeedReplyItem = memo(function FeedReplyItem(props: { eventId: string; hasChildren: boolean }) {
  const { data: event } = useEvent(props.eventId, { relays: FALLBACK_RELAYS })
  if (!event) {
    return <ThreadLoading />
  }
  return <FeedReplyItemLoaded event={event} hasChildren={props.hasChildren} />
})

const FeedReplyItemLoaded = memo(function FeedReplyItemLoaded(props: { event: NostrEventDB; hasChildren: boolean }) {
  const note = useNoteState(props.event, { repliesOpen: false, forceSync: true, contentOpen: false })
  return (
    <NoteProvider value={{ event: props.event }}>
      <ThreadItem
        note={note}
        renderEditor
        renderReplies={false}
        renderThreadIndicator
        forceThreadIndicator={props.hasChildren}
      />
      {!props.hasChildren && !note.state.repliesOpen && (
        <ThreadSummary sx={styles.repliesSummary} note={note} mode='replies' onClick={() => note.toggleReplies(true)} />
      )}
    </NoteProvider>
  )
})

type Props = {
  group: ThreadGroup
}

export const ThreadGroupRoot = memo(function ThreadGroupRoot(props: Props) {
  const { group } = props
  const { data: rootEvent } = useEvent(group.rootId, { relays: FALLBACK_RELAYS })

  return (
    <>
      {rootEvent ? <ThreadGroupRootLoaded event={rootEvent} /> : <ThreadLoading />}
      <ThreadBranches branches={group.branches} />
      <Divider />
    </>
  )
})

const styles = css.create({
  parentSummary: {
    paddingLeft: 11.2,
  },
  repliesSummary: {
    paddingLeft: spacing['padding0.5'],
    paddingBottom: spacing.padding1,
  },
})
