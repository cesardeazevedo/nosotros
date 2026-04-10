import { repliesFamily } from '@/atoms/repliesQuery.atoms'
import { LinkNEvent } from '@/components/elements/Links/LinkNEvent'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventQueryOptions } from '@/hooks/query/useQueryBase'
import { useLiveReplies } from '@/hooks/query/useReplies'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
}

type BranchProps = {
  event: NostrEventDB
  depth: number
  currentId: string
  activeBranchDepths: number[]
  flattenOffsetPending: boolean
  incoming: 'root' | 'chain' | 'branch'
  parentDepth?: number
}

const MINIMAP_WIDTH = 200
const PADDING_X = 6
const AVATAR_SIZE = 20
const NODE_SIZE = 16
const ROW_HEIGHT = 20
const LEVEL_STEP = 14

const getGuideX = (depth: number) => PADDING_X + depth * LEVEL_STEP + NODE_SIZE / 2
const getNodeLeft = (depth: number) => PADDING_X + depth * LEVEL_STEP

const ThreadsMinimapBranch = memo(function ThreadsMinimapBranch(props: BranchProps) {
  const { event, depth, currentId, activeBranchDepths, flattenOffsetPending, incoming, parentDepth } = props
  const replies = useAtomValue(repliesFamily({ event, pageSize: 1000 }))
  const children = replies.sorted
  const isCurrent = event.id === currentId

  const incomingDepth = incoming === 'root' ? undefined : incoming === 'chain' ? depth : parentDepth

  return (
    <>
      <html.div style={styles.row}>
        {isCurrent && <html.div style={styles.current} />}

        {activeBranchDepths.map((branchDepth) => (
          <html.div
            key={`${event.id}:${branchDepth}`}
            style={[styles.guide, styles.guide$full(getGuideX(branchDepth))]}
          />
        ))}

        {incomingDepth !== undefined && !activeBranchDepths.includes(incomingDepth) && (
          <html.div style={[styles.guide, styles.guide$top(getGuideX(incomingDepth))]} />
        )}

        {incoming === 'branch' && parentDepth !== undefined && (
          <html.div style={[styles.arm, styles.arm$position(getGuideX(parentDepth), getGuideX(depth))]} />
        )}

        <LinkNEvent event={event} sx={styles.rowLink}>
          <html.div style={[styles.node, styles.node$position(getNodeLeft(depth))]}>
            <ContentProvider value={{ disableLink: true, disablePopover: true }}>
              <UserAvatar sx={styles.avatar(AVATAR_SIZE)} pubkey={event.pubkey} />
            </ContentProvider>
            <html.span style={styles.label}></html.span>
          </html.div>
        </LinkNEvent>
      </html.div>

      {children.map((child, index) => {
        const isBranch = children.length > 1
        const startsFlattenedBranchLevel = !isBranch && flattenOffsetPending
        const childDepth = isBranch || startsFlattenedBranchLevel ? depth + 1 : depth
        const childActiveBranchDepths =
          isBranch && index < children.length - 1 ? [...activeBranchDepths, depth] : activeBranchDepths
        const childIncoming = isBranch || startsFlattenedBranchLevel ? 'branch' : 'chain'
        const childFlattenOffsetPending = isBranch

        return (
          <ThreadsMinimapBranch
            key={child.id}
            event={child}
            depth={childDepth}
            currentId={currentId}
            activeBranchDepths={childActiveBranchDepths}
            flattenOffsetPending={childFlattenOffsetPending}
            incoming={childIncoming}
            parentDepth={depth}
          />
        )
      })}
    </>
  )
})

export const ThreadsMinimap = memo(function ThreadsMinimap(props: Props) {
  const { event } = props
  const isMobile = useMobile()
  const rootId = event.metadata?.rootId
  const rootQuery = useQuery(
    eventQueryOptions({
      queryKey: ['event', rootId || ''],
      filter: { ids: rootId ? [rootId] : [] },
      enabled: !!rootId,
      select: (events) => events[0],
    }),
  )
  const rootEvent = rootId ? (rootQuery.data ?? event) : event
  const rootReplies = useAtomValue(repliesFamily({ event: rootEvent, pageSize: 1000 }))

  useLiveReplies(event)
  useLiveReplies(rootEvent)

  if (isMobile || rootReplies.total === 0) {
    return null
  }

  return (
    <html.aside style={styles.root}>
      <ContentProvider value={{ disablePopover: true }}>
        <Text variant='label' sx={styles.title}>
          Threads Minimap
        </Text>
        <ThreadsMinimapBranch
          event={rootEvent}
          depth={0}
          currentId={event.id}
          activeBranchDepths={[]}
          flattenOffsetPending={false}
          incoming='root'
        />
      </ContentProvider>
    </html.aside>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: MINIMAP_WIDTH,
    flexShrink: 0,
    overflow: 'hidden',
  },
  title: {
    marginBottom: spacing.margin1,
    textTransform: 'uppercase',
  },
  row: {
    position: 'relative',
    width: '100%',
    height: ROW_HEIGHT,
  },
  current: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    pointerEvents: 'none',
    borderRadius: 999,
    zIndex: 1,
    backgroundColor: palette.tertiary,
  },
  guide: {
    position: 'absolute',
    width: 1.5,
    pointerEvents: 'none',
    borderRadius: 999,
    backgroundColor: palette.outlineVariant,
  },
  guide$full: (left: number) => ({
    left,
    top: 0,
    bottom: 0,
  }),
  guide$top: (left: number) => ({
    left,
    top: 0,
    height: ROW_HEIGHT / 2,
  }),
  arm: {
    position: 'absolute',
    top: ROW_HEIGHT / 2,
    height: 1.5,
    pointerEvents: 'none',
    borderRadius: 999,
    transform: 'translateY(-50%)',
    backgroundColor: palette.outlineVariant,
  },
  arm$position: (left: number, right: number) => ({
    left,
    width: Math.max(right - left, 1.5),
  }),
  rowLink: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '100%',
    borderRadius: shape.sm,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(0, 0, 0, 0.04)',
    },
  },
  node: {
    position: 'absolute',
    top: (ROW_HEIGHT - NODE_SIZE) / 2,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: NODE_SIZE,
    lineHeight: 0,
    fontSize: 0,
  },
  node$position: (left: number) => ({
    left,
  }),
  avatar: (size: number) => ({
    blockSize: size,
    inlineSize: size,
    minBlockSize: size,
    maxBlockSize: size,
    minInlineSize: size,
    border: '0.3px solid',
    borderColor: palette.outlineVariant,
  }),
  label: {
    width: 64,
    height: 16,
    borderRadius: shape.md,
    color: 'black',
    fontSize: 10,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    // backgroundColor: {
    //   default: 'rgba(0, 0, 0, 0.04)',
    //   ':hover': 'rgba(0, 0, 0, 0.08)',
    // },
  },
})
