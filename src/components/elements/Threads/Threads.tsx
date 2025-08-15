import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRootEvent } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { IconThread } from '../Icons/IconThread'
import { ThreadItem } from './ThreadItem'
import { ThreadParents } from './ThreadParents'
import { ThreadRepliesSummary } from './ThreadRepliesSummary'
import { ThreadRoot } from './ThreadRoot'
import { ThreadLoading } from './ThreadRootLoading'

type Props = {
  event: NostrEventDB
  level?: number
  maxLevel?: number
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
    renderReplies = true,
    renderRepliesSummary = true,
    level = 0,
    maxLevel = Infinity,
  } = props

  const note = useNoteState(event, { repliesOpen: true, forceSync: true })
  const root = useRootEvent(event)

  return (
    <NoteProvider value={{ note, event }}>
      {level < maxLevel ? (
        <>
          {!note.metadata?.isRoot ? (
            <>
              {renderParents && (
                <ThreadParents event={event} level={level + 1} maxLevel={maxLevel} renderEditor={renderEditor} />
              )}
              <ThreadItem note={note} renderEditor={renderEditor} renderReplies={renderReplies} />
            </>
          ) : (
            <ThreadRoot note={note} renderEditor={renderEditor} />
          )}

          {renderRepliesSummary && note.repliesTotal > 0 && level === 0 && (
            <html.div style={styles.footer}>
              <ThreadRepliesSummary />
            </html.div>
          )}
        </>
      ) : (
        <>
          {event.metadata?.isRoot && <ThreadRoot note={note} renderEditor={renderEditor} />}
          {!event.metadata?.isRoot &&
            (root.data ? <ThreadRootLoader event={root.data} renderEditor={renderEditor} /> : <ThreadLoading />)}
        </>
      )}
    </NoteProvider>
  )
})

const ThreadRootLoader = memo(function RepliesThreadRoot(props: Pick<Props, 'event' | 'renderEditor'>) {
  const { event, renderEditor } = props
  const note = useNoteState(event, { repliesOpen: false, forceSync: true })
  return (
    <NoteProvider value={{ note, event }}>
      <ThreadRoot note={note} renderEditor={renderEditor} />
      <Stack sx={styles.thread} gap={0.5}>
        <IconThread />
        <ThreadRepliesSummary />
      </Stack>
    </NoteProvider>
  )
})

const styles = css.create({
  thread: {
    paddingTop: -0.1,
    paddingLeft: 11.4,
    position: 'relative',
    top: -2,
    color: palette.outlineVariant,
  },
  footer: {
    paddingBlock: spacing.padding1,
  },
})
