import { useRouter } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import type Note from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import PaperContainer from '../Layouts/PaperContainer'
import PostActions from './PostActions/PostActions'
import PostContent from './PostContent'
import PostHeader from './PostHeader'
import PostReplies from './PostReplies/PostReplies'

export type Props = { id: string } | { note: Note }

const Post = observer(function Post(props: Props) {
  const note = 'id' in props ? noteStore.get(props.id) : props.note
  const isMobile = useMobile()
  const router = useRouter()

  const handleRepliesClick = useCallback(() => {
    if (note) {
      if (isMobile) {
        router.navigate({
          to: '/$nostr/replies',
          params: { nostr: note.nevent },
          // state: { from: router.latestLocation.pathname },
        })
      } else {
        note.toggleReplies()
      }
    }
  }, [router, isMobile, note])

  if (!note) {
    return <></>
  }

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
