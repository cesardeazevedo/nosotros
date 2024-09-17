import { Divider } from '@/components/ui/Divider/Divider'
import { useCurrentRoute } from '@/hooks/useNavigations'
import { useRouter } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import type Note from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import PostActions from './PostActions/PostActions'
import PostContent from './PostContent'
import PostCreateForm from './PostCreate/PostCreateForm'
import PostHeader from './PostHeader'
import PostReplies from './PostReplies/PostReplies'
import { spacing } from '@/themes/spacing.stylex'

export type Props = { id: string } | { note: Note }

const Post = observer(function Post(props: Props) {
  const note = 'id' in props ? noteStore.get(props.id) : props.note
  const isMobile = useMobile()
  const router = useRouter()
  const currentRoute = useCurrentRoute()

  const handleRepliesClick = useCallback(() => {
    if (note) {
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
        note.toggleReplies()
      }
    }
  }, [router, isMobile, note, currentRoute.routeId])

  if (!note) {
    return <></>
  }

  return (
    <>
      <PostHeader note={note} />
      <PostContent note={note} />
      <PostActions note={note} onReplyClick={handleRepliesClick} />
      {note.repliesOpen && (
        <>
          <Divider />
          <html.div style={styles.root}>
            <PostCreateForm dense renderBubble defaultOpen={false} />
          </html.div>
        </>
      )}
      <PostReplies note={note} />
    </>
  )
})

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
  },
})

export default Post
