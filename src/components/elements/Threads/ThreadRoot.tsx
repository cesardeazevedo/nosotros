import { ContentProvider } from '@/components/providers/ContentProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import type { NoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'
import { NostrEventUnsupported } from '../Event/NostrEventUnsupported'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostContent } from '../Posts/PostContent'
import { PostHeader } from '../Posts/PostHeader'
import { ReplyLink } from '../Replies/ReplyLink'

type Props = {
  note: NoteState
  renderEditor?: boolean
}

export const ThreadRoot = memo(function ThreadRoot(props: Props) {
  const { note, renderEditor } = props
  return (
    <ContentProvider value={{ dense: true }}>
      <Stack gap={2} align='flex-start' sx={styles.root}>
        <html.div style={styles.thread} />
        <Stack horizontal={false} grow>
          <PostHeader event={note.event} renderOptions={false} />
          {![Kind.Text, Kind.Comment, Kind.Article].includes(note.event.kind) ? (
            <NostrEventUnsupported sx={styles.unsupported} event={note.event} />
          ) : (
            <>
              <Stack horizontal={false} sx={styles.rootWrapper}>
                <ReplyLink nevent={note.nip19}>
                  <PostContent note={note} />
                </ReplyLink>
                <PostActions
                  note={note}
                  renderOptions
                  onReplyClick={() => note.actions.toggleReplying()}
                  sx={styles.actions}
                />
              </Stack>
              {renderEditor && (
                <html.div style={styles.editor}>
                  <Expandable expanded={note.state.isReplying || false} trigger={() => <></>}>
                    <EditorProvider renderBubble initialOpen parent={note.event} />
                  </Expandable>
                </html.div>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </ContentProvider>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  actions: {
    paddingTop: spacing.padding1,
  },
  rootWrapper: {
    position: 'relative',
    paddingTop: 0,
    paddingLeft: spacing.padding8,
    paddingRight: spacing.padding4,
    paddingBottom: spacing.padding2,
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
      top: 0,
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
    marginLeft: spacing.margin6,
  },
  editor: {
    position: 'relative',
    paddingRight: spacing.padding2,
  },
})
