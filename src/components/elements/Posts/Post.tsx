import { ArticleHeadline } from '@/components/modules/Articles/ArticleHeadline'
import { useNostrContext } from '@/components/providers/NostrContextProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
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
  const isFeed = !!useNostrContext()
  const note = useNoteState(event, { repliesOpen: open, forceSync: open, contentOpen: open })

  const openReplies = useCallback(() => {
    note.actions.toggleReplies()
  }, [])

  return (
    <NoteProvider value={{ event }}>
      <html.article style={[isFeed && styles.divider]} ref={note.ref}>
        <PostLink note={note} onClick={openReplies}>
          {note.event.kind === Kind.Article && <ArticleHeadline />}
          {header || <PostHeader event={event} />}
          <PostContent note={note} />
          <PostActions note={note} onReplyClick={openReplies} />
          {note.state.repliesOpen === null && event.kind === Kind.Text && <RepliesPreview note={note} />}
        </PostLink>
        <Expandable expanded={note.state.broadcastOpen}>
          <PostBroadcaster note={note} />
        </Expandable>
        {note.state.repliesOpen && (
          <>
            <Divider />
            <EditorProvider sx={styles.editor} parent={event} renderBubble initialOpen />
            <Replies note={note} />
          </>
        )}
      </html.article>
    </NoteProvider>
  )
})

const styles = css.create({
  divider: {
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
  },
  editor: {
    padding: spacing.padding2,
    paddingTop: spacing.padding2,
    paddingBottom: 0,
  },
})
