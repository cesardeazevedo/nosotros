import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import { modelStore } from '@/stores/base/model.store'
import { useNoteOpen } from '@/stores/nevent/nevent.hooks'
import type { NEventModule } from '@/stores/nevent/nevent.module'
import { spacing } from '@/themes/spacing.stylex'
import { useRouteContext } from '@tanstack/react-router'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  module: NEventModule
}

export const NEventColumn = observer(function NEventColumn(props: Props) {
  const { module } = props

  const context = useRouteContext({ from: '/deck' })
  const event = modelStore.getEvent(module.options.id)
  useNoteOpen(module.options.id)

  return (
    <>
      <DeckColumnHeader id={module.id}>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none' sx={styles.container}>
        <PostAwait rows={1} promise={context.delay}>
          {!event && <PostLoading rows={1} />}
          {event && <NostrEventRoot event={event} />}
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
