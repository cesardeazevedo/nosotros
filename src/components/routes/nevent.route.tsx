import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import Post from 'components/elements/Posts/Post'
import PostLoading from 'components/elements/Posts/PostLoading'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useStore } from 'stores'

type Props = {
  id: string
  author?: string
  relays?: string[]
}

const NEventRoute = observer(function NoteRoute(props: Props) {
  const { id, author, relays } = props
  const store = useStore()

  const post = store.notes.getNoteById(id)

  useEffect(() => {
    window.scrollTo(0, 0)
    store.initializePostRoute(id, author, relays)
  }, [store, id, author, relays])

  useEffect(() => {
    if (post) {
      post.openReplies()
      store.subscriptions.subReactions([post.id])
    }
  }, [store, post])

  return (
    <CenteredContainer maxWidth='sm' sx={{ mb: 20 }}>
      {post ? <Post note={post} /> : <PostLoading />}
    </CenteredContainer>
  )
})

export default NEventRoute
