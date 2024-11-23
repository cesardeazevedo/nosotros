import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { useMobile } from '@/hooks/useMobile'
import type { Note } from '@/stores/models/note'
import { spacing } from '@/themes/spacing.stylex'
import { useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { ComposeForm } from '../Compose/ComposeForm'
import { PostActions } from './PostActions/PostActions'
import { PostBroadcaster } from './PostBroadcaster'
import { PostContent } from './PostContent'
import { PostHeader } from './PostHeader'
import { PostReplies } from './PostReplies/PostReplies'
import { PostRepliesPreview } from './PostReplies/PostRepliesPreview'

type Props = {
  note: Note
  header?: React.ReactNode
}

export const PostRoot = observer(function PostRoot(props: Props) {
  const { note, header } = props
  const isMobile = useMobile()
  const router = useRouter()

  const handleRepliesClick = useCallback(() => {
    if (isMobile) {
      router.navigate({
        // @ts-ignore
        to: './replies/$nevent',
        // @ts-ignore
        params: { nevent: note.nevent },
        // @ts-ignore
        state: { from: router.latestLocation.pathname },
      })
    } else {
      note!.toggleReplies()
    }
  }, [router.latestLocation.pathname, isMobile, note])

  const handleLoadMore = useCallback(() => {
    if (note?.repliesOpen) {
      note.paginate()
    } else {
      handleRepliesClick()
    }
  }, [note])

  return (
    <html.div style={styles.root}>
      {header || <PostHeader note={note} />}
      <PostContent note={note} />
      <PostActions note={note} onReplyClick={handleRepliesClick} />
      <Expandable expanded={note.broadcastOpen}>
        <PostBroadcaster note={note} />
      </Expandable>
      {note.repliesOpen && (
        <>
          <Divider />
          <html.div style={styles.compose}>
            <ComposeForm dense renderBubble initialOpen={false} parentNote={note} />
          </html.div>
          <PostReplies note={note} renderEmpty onLoadMoreClick={handleLoadMore} />
        </>
      )}
      {note.repliesOpen === null && <PostRepliesPreview note={note} onLoadMoreClick={handleRepliesClick} />}
    </html.div>
  )
})

const styles = css.create({
  root: {
    minHeight: 147,
  },
  compose: {
    paddingInline: spacing.padding2,
  },
})
