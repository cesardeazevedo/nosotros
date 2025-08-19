import { ArticleHeadline } from '@/components/modules/Articles/ArticleHeadline'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'
import { Replies } from '../Replies/Replies'
import { RepliesPreview } from '../Replies/RepliesPreview'
import { PostActions } from './PostActions/PostActions'
import { PostBroadcaster } from './PostBroadcaster'
import { PostContent } from './PostContent'
import { PostHeader } from './PostHeader'
import { PostLink } from './PostLink'

type Props = {
  event: NostrEventDB
  header?: React.ReactNode
  open?: boolean
}

export const PostRoot = memo(function PostRoot(props: Props) {
  const { event, header, open } = props
  const note = useNoteState(event, { repliesOpen: open, forceSync: open })

  const openReplies = useCallback(() => {
    note.actions.toggleReplies()
  }, [])

  return (
    <NoteProvider value={{ event, note }}>
      <html.article style={styles.root} ref={note.ref}>
        <PostLink note={note} onClick={openReplies}>
          {note.event.kind === Kind.Article && <ArticleHeadline />}
          {header || <PostHeader event={event} />}
          <PostContent />
          <PostActions onReplyClick={openReplies} />
          {note.state.repliesOpen === null && <RepliesPreview onLoadMoreClick={openReplies} />}
        </PostLink>
        <Expandable expanded={note.state.broadcastOpen}>
          <PostBroadcaster />
        </Expandable>
        {note.state.repliesOpen && (
          <>
            <Divider />
            <EditorProvider sx={styles.editor} parent={event} renderBubble initialOpen />
            <Replies />
          </>
        )}
      </html.article>
    </NoteProvider>
  )
})

const fadeIn = css.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const styles = css.create({
  root: {
    animation: fadeIn,
    animationTimingFunction: easing.emphasizedDecelerate,
    animationDuration: duration.long3,
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
  },
  editor: {
    padding: spacing.padding2,
    paddingTop: spacing.padding2,
    paddingBottom: 0,
  },
})
