import { ContentProvider } from '@/components/providers/ContentProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import type { NoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useDeferredValue } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'
import { NostrEventUnsupportedContent } from '../Event/NostrEventUnsupportedContent'
import { LinkNEvent } from '../Links/LinkNEvent'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostContent } from '../Posts/PostContent'
import { PostHeader } from '../Posts/PostHeader'
import { Replies } from '../Replies/Replies'

type Props = {
  note: NoteState
  renderEditor?: boolean
  renderReplies?: boolean
}

export const ThreadRoot = memo(function ThreadRoot(props: Props) {
  const { note, renderEditor, renderReplies = false } = props
  const isReplyingDeferred = useDeferredValue(note.state.isReplying)
  return (
    <ContentProvider value={{ dense: false }}>
      <Stack gap={2} align='flex-start' sx={styles.root}>
        <html.div style={styles.thread} />
        <Stack horizontal={false} sx={styles.content}>
          <PostHeader event={note.event} renderOptions={false} />
          {![Kind.Text, Kind.Comment, Kind.Article, Kind.Media, Kind.Video, Kind.ShortVideo].includes(note.event.kind) ? (
            <NostrEventUnsupportedContent sx={styles.unsupported} event={note.event} />
          ) : (
            <>
              <Stack horizontal={false} sx={styles.rootWrapper}>
                <LinkNEvent nevent={note.nip19}>
                  <PostContent note={note} />
                </LinkNEvent>
                <ContentProvider value={{ dense: true }}>
                  <PostActions
                    note={note}
                    statsPopover
                    renderOptions
                    onReplyClick={() => note.actions.toggleReplying()}
                    sx={styles.actions}
                  />
                </ContentProvider>
              </Stack>
              {renderEditor && (
                <html.div style={styles.editor}>
                  {note.state.isReplying && (
                    <Expandable expanded={isReplyingDeferred} trigger={() => <></>}>
                      <EditorProvider renderBubble initialOpen parent={note.event} />
                    </Expandable>
                  )}
                </html.div>
              )}
            </>
          )}
        </Stack>
      </Stack>
      {renderReplies && <Replies note={note} />}
    </ContentProvider>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  content: {
    width: '100%',
  },
  actions: {
    marginLeft: spacing.margin1,
  },
  rootWrapper: {
    position: 'relative',
    paddingTop: 0,
    paddingLeft: spacing.padding7,
    paddingRight: spacing.padding2,
  },
  thread: {
    position: 'absolute',
    top: 60,
    left: 28,
    width: 12,
    bottom: 0,
    ':before': {
      content: '',
      position: 'relative',
      top: 4,
      left: 6,
      width: 3,
      borderRadius: 4,
      height: '100%',
      pointerEvents: 'none',
      display: 'inline-block',
      backgroundColor: palette.outlineVariant,
    },
  },
  unsupported: {
    marginLeft: spacing.margin8,
    marginRight: spacing.margin2,
  },
  editor: {
    position: 'relative',
    paddingRight: spacing.padding2,
  },
})
