import { ArticleHeadline } from '@/components/modules/Articles/ArticleHeadline'
import { useNostrContext } from '@/components/providers/NostrContextProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMuted } from '@/hooks/useMuted'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'
import { Replies } from '../Replies/Replies'
import { RepliesPreview } from '../Replies/RepliesPreview'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostContentHidden } from './PostContentHidden'
import { PostCountdown } from './PostCountdown'
import { PostHeader } from './PostHeader'
import { PostLink } from './PostLink'
import { PostStats } from './PostStats'

type Props = {
  event: NostrEventDB
  header?: React.ReactNode
  open?: boolean
}

export const PostRoot = memo(function PostRoot(props: Props) {
  const { event, header, open } = props
  const isFeed = !!useNostrContext()
  const note = useNoteState(event, { repliesOpen: open, forceSync: open, contentOpen: open })
  const pubkey = useCurrentPubkey()
  const { isMuted } = useMuted(event)
  const [showMutedContent, setShowMutedContent] = useState(false)
  const hideContent = !!isMuted && !showMutedContent

  const openReplies = useCallback(() => {
    note.toggleReplies()
  }, [note])

  return (
    <NoteProvider value={{ event }}>
      <html.article style={[isFeed && styles.divider]}>
        <PostLink note={note}>
          {event.pubkey === pubkey && <PostCountdown id={event.id} />}
          {header || <PostHeader event={event} />}
          {hideContent && <PostContentHidden onClick={() => setShowMutedContent(true)} />}
          {!hideContent && (
            <>
              {note.event.kind === Kind.Article && <ArticleHeadline />}
              <PostContent note={note} />
              <PostActions note={note} onReplyClick={openReplies} />
              <PostStats note={note} renderDivider />
              {note.state.repliesOpen === null && event.kind === Kind.Text && <RepliesPreview note={note} />}
            </>
          )}
        </PostLink>
        {!hideContent && note.state.repliesOpen && (
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
