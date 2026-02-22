import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useParentEvent } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { memo, useState } from 'react'
import { css } from 'react-strict-dom'
import { ThreadItem } from './ThreadItem'
import { ThreadParents } from './ThreadParents'
import { ThreadRoot } from './ThreadRoot'
import { ThreadLoading } from './ThreadRootLoading'
import { ThreadSummary } from './ThreadSummary'

type Props = {
  event: NostrEventDB
  level?: number
  maxLevel?: number
  parentSummaryCount?: number
  parentSummaryPubkeys?: string[]
  includeRootParent?: boolean
  renderThreadIndicator?: boolean
  forceThreadIndicator?: boolean
  renderParents?: boolean
  renderReplies?: boolean
  renderRepliesSummary?: boolean
  renderEditor?: boolean
}

export const Threads = memo(function RepliesThread(props: Props) {
  const {
    event,
    renderEditor = true,
    renderParents = true,
    renderReplies = false,
    level = 0,
    maxLevel = Infinity,
    parentSummaryCount = 0,
    parentSummaryPubkeys,
    includeRootParent = true,
    renderThreadIndicator = true,
    forceThreadIndicator = false,
  } = props

  const note = useNoteState(event, { repliesOpen: renderReplies ? true : false, forceSync: true, contentOpen: false })
  const [showFullParents, setShowFullParents] = useState(false)
  const parent = useParentEvent(event)
  const hasParentId = !!event.metadata?.parentId
  const isParentRootReference = !!event.metadata?.parentId && event.metadata?.parentId === event.metadata?.rootId
  const requiresLoadedParent = renderParents && (includeRootParent || !isParentRootReference)
  const parentReady = !hasParentId || !requiresLoadedParent || !!parent.data
  // At capped depth we still render the current note even if its own parent is missing.
  // Otherwise parent rows can disappear and make child rows look orphaned.
  const shouldRenderNoteItem = !renderParents || parentReady || level >= maxLevel
  const shouldShowParentSummary = parentSummaryCount > 0 && !showFullParents

  return (
    <NoteProvider value={{ event }}>
      {level < maxLevel ? (
        <>
          {note.metadata?.isRoot === false ? (
            <>
              {renderParents && (
                <ThreadParents
                  event={event}
                  level={level + 1}
                  maxLevel={maxLevel}
                  parentSummaryCount={parentSummaryCount}
                  parentSummaryPubkeys={parentSummaryPubkeys}
                  includeRootParent={includeRootParent}
                  renderThreadIndicator={renderThreadIndicator}
                  renderEditor={renderEditor}
                />
              )}
              {shouldRenderNoteItem ? (
                <ThreadItem
                  note={note}
                  renderEditor={renderEditor}
                  renderReplies={renderReplies && level === 0}
                  renderThreadIndicator={renderThreadIndicator}
                  forceThreadIndicator={forceThreadIndicator}
                />
              ) : null}
            </>
          ) : (
            // {/* disable the thead line here if renderReplies is true */}
            <ThreadRoot note={note} renderEditor={renderEditor} renderReplies={renderReplies && level === 0} />
          )}
        </>
      ) : (
        <>
          {event.metadata?.isRoot === true && <ThreadRoot note={note} renderEditor={renderEditor} renderReplies={renderReplies} />}
          {event.metadata?.isRoot === false && (
            <>
              {shouldShowParentSummary && (
                <Stack sx={styles.parentSummary}>
                  <ThreadSummary
                    note={note}
                    mode='parents'
                    count={parentSummaryCount}
                    pubkeysOverride={parentSummaryPubkeys}
                    renderThreadIcon
                    onClick={() => {
                      setShowFullParents(true)
                    }}
                  />
                </Stack>
              )}
              {showFullParents && renderParents && (
                <ThreadParents
                  event={event}
                  level={level + 1}
                  maxLevel={Infinity}
                  parentSummaryCount={0}
                  parentSummaryPubkeys={parentSummaryPubkeys}
                  includeRootParent={includeRootParent}
                  renderThreadIndicator={renderThreadIndicator}
                  renderEditor={renderEditor}
                />
              )}
              {shouldRenderNoteItem ? (
                <ThreadItem
                  note={note}
                  renderEditor={renderEditor}
                  renderReplies={false}
                  renderThreadIndicator={renderThreadIndicator}
                  forceThreadIndicator={forceThreadIndicator}
                />
              ) : (
                <ThreadLoading />
              )}
            </>
          )}
        </>
      )}
    </NoteProvider>
  )
})

const styles = css.create({
  parentSummary: {
    paddingLeft: 7.5,
  },
})
