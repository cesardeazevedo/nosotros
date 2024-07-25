import { useLoaderData } from '@tanstack/react-router'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import Post from 'components/elements/Posts/Post'
import PostLoading from 'components/elements/Posts/PostLoading'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { NoteModule } from 'stores/modules/note.module'
import { deckStore } from 'stores/ui/deck.store'

type Props = {
  id: string
  kind?: number
  author?: string
  relays?: string[]
}

export function loadNote(props: Props) {
  return deckStore.add(new NoteModule({ ...props, noteId: props.id }))
}

const NEventRoute = observer(function NoteRoute() {
  const module = useLoaderData({ from: '/$nostr' }) as NoteModule

  useModuleSubscription(module)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <CenteredContainer maxWidth='sm' sx={{ mb: 20 }}>
      {module.note ? <Post note={module.note} /> : <PostLoading />}
    </CenteredContainer>
  )
})

export default NEventRoute
