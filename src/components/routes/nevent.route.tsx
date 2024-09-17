import { spacing } from '@/themes/spacing.stylex'
import { useLoaderData } from '@tanstack/react-router'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import Post from 'components/elements/Posts/Post'
import PostLoading from 'components/elements/Posts/PostLoading'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css } from 'react-strict-dom'
import { NoteModule } from 'stores/modules/note.module'
import { deckStore } from 'stores/ui/deck.store'
import PaperContainer from '../elements/Layouts/PaperContainer'

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
    <CenteredContainer sx={styles.root}>
      <PaperContainer elevation={2}>{module.note ? <Post note={module.note} /> : <PostLoading />}</PaperContainer>
    </CenteredContainer>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  root: {
    marginTop: {
      default: spacing.margin4,
      [MOBILE]: 0,
    },
    paddingBottom: 200,
  },
})

export default NEventRoute
