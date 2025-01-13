import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import { modelStore } from '@/stores/base/model.store'
import { useObservableNostrContext } from '@/stores/context/nostr.context.hooks'
import { useNoteOpen } from '@/stores/nevent/nevent.hooks'
import type { NEventModule } from '@/stores/nevent/nevent.module'
import { spacing } from '@/themes/spacing.stylex'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { observer } from 'mobx-react-lite'
import { useSubscription } from 'observable-hooks'
import { css } from 'react-strict-dom'

type Props = {
  module: NEventModule
}

export const NEventColumn = observer(function NEventColumn(props: Props) {
  const { module } = props

  const event = modelStore.getEvent(module.options.id)
  useNoteOpen(module.options.id)

  const sub = useObservableNostrContext((context) => module.start(context.client))
  useSubscription(sub)

  return (
    <>
      <DeckColumnHeader id={module.id} name='Post'>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none' sx={styles.container}>
        {!event && <PostLoading rows={1} />}
        {event && <NostrEventRoot event={event} />}
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
