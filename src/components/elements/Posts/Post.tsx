import { useNoteVisibility } from '@/components/elements/Posts/hooks/useNoteVisibility'
import { useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Kind } from '@/constants/kinds'
import { useMobile } from '@/hooks/useMobile'
import { useNoteStore } from '@/hooks/useNoteStore'
import { useRootContext } from '@/hooks/useRootStore'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import type { NostrEventMetadata } from '@/nostr/types'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { ArticleHeader } from '../Articles/ArticleHeader'
import { Editor } from '../Editor/Editor'
import { Replies } from '../Replies/Replies'
import { RepliesPreview } from '../Replies/RepliesPreview'
import { PostActions } from './PostActions/PostActions'
import { PostBroadcaster } from './PostBroadcaster'
import { PostContent } from './PostContent'
import { PostHeader } from './PostHeader'
import { PostLink } from './PostLink'

type Props = {
  open?: boolean
  event: NostrEventMetadata
  header?: React.ReactNode
}

export const PostRoot = observer(function PostRoot(props: Props) {
  const { event, header, open = false } = props
  const isMobile = useMobile()
  const router = useRouter()
  const [ref] = useNoteVisibility(event)
  const context = useRootContext()
  const contentContext = useContentContext()
  const note = useNoteStore(event, open)

  const handleRepliesClick = useCallback(() => {
    note.toggleReplies()
    note.setRepliesStatus('LOADING')
    subscribeNoteStats(note.event.event, context, {}).subscribe({
      complete: () => {
        note.setRepliesStatus('LOADED')
      },
    })
  }, [router.latestLocation.pathname, isMobile, note])

  const handleLoadMore = useCallback(() => {
    if (note?.repliesOpen) {
      note.paginate()
    } else {
      handleRepliesClick()
    }
  }, [note])

  return (
    <NoteProvider value={{ ...contentContext, note }}>
      <html.article style={styles.root} ref={ref}>
        <PostLink note={note} onClick={handleRepliesClick}>
          {note.event.event.kind === Kind.Article && <ArticleHeader />}
          {header || <PostHeader />}
          <PostContent />
          <PostActions onReplyClick={handleRepliesClick} />
          {note.repliesOpen === null && <RepliesPreview onLoadMoreClick={handleRepliesClick} />}
        </PostLink>
        <Expandable expanded={note.broadcastOpen}>
          <PostBroadcaster />
        </Expandable>
        {note.repliesOpen && (
          <>
            {/* <Divider /> */}
            <Editor sx={styles.editor} renderBubble initialOpen={false} store={note.editor} />
            <Replies onLoadMoreClick={handleLoadMore} />
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
  },
  editor: {
    padding: spacing.padding2,
    paddingTop: spacing.padding2,
    paddingBottom: 0,
  },
})
