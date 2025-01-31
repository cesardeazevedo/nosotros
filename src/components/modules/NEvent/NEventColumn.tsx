import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import type { NEventModule } from '@/stores/nevent/nevent.module'
import { spacing } from '@/themes/spacing.stylex'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  module: NEventModule
}

export const NEventColumn = observer(function NEventColumn(props: Props) {
  const { module } = props

  const context = useContext(DeckContext)
  const note = useNoteStoreFromId(module.options.id)

  return (
    <>
      <DeckColumnHeader id={module.id}>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none' sx={styles.container}>
        <PostAwait rows={1} promise={context.delay}>
          {!note && <PostLoading rows={1} />}
          {note && <NostrEventRoot open event={note.event.event} />}
        </PostAwait>
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
