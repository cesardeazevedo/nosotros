import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { noteStore } from 'stores/nostr/notes.store'
import PostCreateForm from '../PostCreate/PostCreateForm'
import PostReplies from './PostReplies'

type Props = {
  noteId?: string
}

const PostRepliesDialog = observer(function PostRepliesDialog(props: Props) {
  const { noteId } = props
  const id = useMemo(() => noteId || '', [])
  const note = noteStore.get(id)
  const mobile = useMobile()

  useEffect(() => {
    if (note) {
      note.toggleReplies(true)
      note.subscribeReplies()
    }
    return () => {
      note?.toggleReplies(false)
    }
  }, [note])

  return (
    <Stack horizontal={false} sx={styles.root1}>
      <RemoveScroll>
        <html.div style={[styles.content, mobile && styles.content$mobile]}>
          <PostReplies renderEmpty note={note} />
        </html.div>
      </RemoveScroll>
      <html.div style={[styles.footer, mobile && styles.footer$mobile]}>
        <PostCreateForm dense renderBubble renderDiscard={false} />
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root1: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  root: {
    position: 'relative',
    paddingTop: spacing.padding2,
  },
  content: {
    paddingBottom: 250,
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
  },
  content$mobile: {
    height: '100vh',
  },
  footer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 1000,
    width: '100%',
    paddingInline: spacing.padding1,
    backgroundColor: 'transparent',
  },
  footer$mobile: {
    borderTopWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLowest,
  },
  bubble: {
    width: '100%',
  },
  empty: {},
})

export default PostRepliesDialog
