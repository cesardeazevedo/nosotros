import { useRouter } from '@tanstack/react-router'
import PaperContainer from 'components/elements/Layouts/PaperContainer'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import type { Note } from 'stores/modules/note.store'
import PostActions from './PostActions/PostActions'
import PostContent from './PostContent'
import PostHeader from './PostHeader'
import PostReplies from './PostReplies/PostReplies'

export type Props = {
  note: Note
}

const Post = observer(function Post(props: Props) {
  const { note } = props
  const isMobile = useMobile()
  const router = useRouter()

  const handleRepliesClick = useCallback(() => {
    if (isMobile) {
      router.navigate({
        to: '/$nostr/replies',
        params: { nostr: note.nevent },
        state: { from: router.latestLocation.pathname },
      })
    } else {
      note.toggleReplies()
    }
  }, [router, isMobile, note])

  return (
    <PaperContainer>
      <PostHeader note={note} />
      <PostContent note={note} />
      <PostActions note={note} onReplyClick={handleRepliesClick} />
      <PostReplies note={note} onReplyClick={handleRepliesClick} />
    </PaperContainer>
  )
})

export default Post
