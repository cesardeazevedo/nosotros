import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import { noteStore } from '@/stores/nostr/notes.store'
import { spacing } from '@/themes/spacing.stylex'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import { css } from 'react-strict-dom'
import type { NoteModule } from 'stores/modules/note.module'

type Props = {
  module: NoteModule
}

export const PostColumn = observer(function PostColumn(props: Props) {
  const { module } = props

  const sub = useObservable(() => module.start())
  useSubscription(sub)

  const note = module.note || noteStore.get(module.options.data.id)

  return (
    <>
      <DeckColumnHeader id={module.id} name='Post'>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none' sx={styles.container}>
        {note && <FeedItem item={note} />}
        <Divider />
      </PaperContainer>
    </>
  )
})

const styles = css.create({
  container: {
    overflowY: 'auto',
    paddingBottom: spacing.padding6,
  },
})
