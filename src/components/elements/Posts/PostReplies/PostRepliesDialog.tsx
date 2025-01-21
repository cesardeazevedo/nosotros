import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { noteStore } from '@/stores/notes/notes.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { Editor } from '../../Editor/Editor'
import { PostReplies } from './PostReplies'

type Props = {
  noteId: string | undefined
}

export const PostRepliesDialog = observer(function PostRepliesDialog(props: Props) {
  const { noteId } = props
  const note = noteStore.get(noteId)
  const mobile = useMobile()

  useEffect(() => {
    note?.toggleReplies(true)
    return () => {
      note?.toggleReplies(false)
    }
  }, [note])

  return (
    <Stack horizontal={false} sx={styles.root}>
      <RemoveScroll>
        <html.div style={[styles.content, mobile && styles.content$mobile]}>
          {note && <PostReplies renderEmpty note={note} />}
        </html.div>
      </RemoveScroll>
      <html.div style={[styles.footer, mobile && styles.footer$mobile]}>
        {note && <Editor dense renderBubble store={note?.editor} renderDiscard={false} />}
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    width: '100vw',
    height: '100%',
  },
  content: {
    paddingBottom: 200,
    width: '100%',
    height: 'calc(100vh - 100px)',
    overflowY: 'scroll',
  },
  content$mobile: {
    height: 'calc(100vh - 100px)',
  },
  footer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 1000,
    width: '100%',
    paddingInline: spacing.padding1,
    backgroundColor: palette.surface,
  },
  footer$mobile: {
    borderTopWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  bubble: {
    width: '100%',
  },
  empty: {},
})
