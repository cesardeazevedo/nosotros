import type { ThreadBranch, ThreadBranchItem, ThreadGroup } from '@/atoms/threads.atoms'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions, useEvent } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useQueries } from '@tanstack/react-query'
import React, { memo, useEffect, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { ThreadHorizontalDivider } from './ThreadHorizontalDivider'
import { ThreadItem } from './ThreadItem'
import { ThreadRoot } from './ThreadRoot'
import { ThreadLoading } from './ThreadRootLoading'
import { ThreadSummary } from './ThreadSummary'
import { PostOptions } from '../Posts/PostOptions'
import { PostUserHeader } from '../Posts/PostUserHeader'


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

const ThreadGroupRootSticky = memo(function ThreadGroupRootSticky(props: {
  event: NostrEventDB
  sx?: SxProps
  onClick?: () => void
}) {
  const preview = (props.event.content || '').replace(/\s+/g, ' ').trim()
  return (
    <Stack justify='space-between' sx={[styles.stickyRoot, props.sx]}>
      <Stack grow sx={styles.stickyRootHeader} onClick={props.onClick}>
        <PostUserHeader
          event={props.event}
          dense
          renderNIP05={false}
          grow
          sx={styles.stickyRootHeaderContent}
          userAvatarProps={{ size: 'md' }}
          footer={
            <Text variant='body' size='md' element={html.div} sx={styles.stickyRootPreview}>
              {preview || '...'}
            </Text>
          }
        />
      </Stack>
      <Stack sx={styles.stickyRootOptions}>
        <PostOptions event={props.event} />
      </Stack>
    </Stack>
  )
})

type Props = {
  group: ThreadGroup
}

export const ThreadGroupRoot = memo(function ThreadGroupRoot(props: Props) {
  const { group } = props
  const { data: rootEvent } = useEvent(group.rootId, { relays: FALLBACK_RELAYS })
  const groupRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [fixed, setFixed] = useState(false)
  const [fixedRect, setFixedRect] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const rafRef = useRef<number | null>(null)
  const fixedRef = useRef(false)
  const rectRef = useRef({ left: 0, width: 0 })

  useEffect(() => {
    const scrollContainer = groupRef.current?.closest('[data-feed-scroll="1"]') as HTMLElement | null

    const update = () => {
      const el = groupRef.current
      if (!el) {
        if (fixedRef.current) {
          fixedRef.current = false
          setFixed(false)
        }
        return
      }
      const rect = el.getBoundingClientRect()
      const shouldFix = rect.top <= 0 && rect.bottom > 72
      if (fixedRef.current !== shouldFix) {
        fixedRef.current = shouldFix
        setFixed(shouldFix)
      }
      if (shouldFix) {
        const nextLeft = Math.round(rect.left)
        const nextWidth = Math.round(rect.width)
        if (rectRef.current.left !== nextLeft || rectRef.current.width !== nextWidth) {
          rectRef.current = { left: nextLeft, width: nextWidth }
          setFixedRect(rectRef.current)
        }
      }
    }

    const scheduleUpdate = () => {
      if (rafRef.current !== null) {
        return
      }
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        update()
      })
    }

    scheduleUpdate()
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', scheduleUpdate, { passive: true })
    } else {
      window.addEventListener('scroll', scheduleUpdate, { passive: true })
    }
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', scheduleUpdate)
      } else {
        window.removeEventListener('scroll', scheduleUpdate)
      }
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [group.rootId])

  return (
    <html.div style={styles.group} ref={groupRef}>
      {rootEvent && fixed && (
        <ThreadGroupRootSticky
          event={rootEvent}
          sx={styles.stickyRoot$fixed(fixedRect.left, fixedRect.width)}
          onClick={() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      )}
      <html.div ref={rootRef}>{rootEvent ? <ThreadGroupRootLoaded event={rootEvent} /> : <ThreadLoading />}</html.div>
      <ThreadBranches branches={group.branches} />
      <Divider />
    </html.div>
  )
})

const styles = css.create({
  group: {
    position: 'relative',
  },
  parentSummary: {
    paddingLeft: 11.2,
  },
  repliesSummary: {
    paddingLeft: spacing['padding0.5'],
    paddingBottom: spacing.padding1,
  },
  stickyRoot: {
    position: 'relative',
    zIndex: 40,
    gap: spacing.padding1,
    marginInline: spacing.margin2,
    marginBottom: spacing.margin1,
    padding: 9.8,
    // paddingBlock: spacing['padding0.5'],
    borderRadius: shape.md,
    backgroundColor: palette.surfaceContainerLowest,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
    overflow: 'hidden',
  },
  stickyRootHeader: {
    cursor: 'pointer',
    minWidth: 0,
    flex: 1,
  },
  stickyRootHeaderContent: {
    width: 'auto',
    height: 'auto',
    minWidth: 0,
  },
  stickyRootOptions: {
    flexShrink: 0,
  },
  stickyRoot$fixed: (left: number, width: number) => ({
    position: 'fixed',
    top: 0,
    left,
    width,
    zIndex: 120,
    marginInline: 0,
    borderRadius: 0,
  }),
  stickyRootName: {
    // whiteSpace: 'nowrap',
    // overflowX: 'hidden',
    // textOverflow: 'ellipsis',
  },
  stickyRootPreview: {
    width: '100%',
    minWidth: 0,
    display: 'block',
    color: palette.onSurfaceVariant,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})
