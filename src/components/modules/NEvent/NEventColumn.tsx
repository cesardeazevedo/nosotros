import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { neventLoader } from '@/components/routes/nevent/nevent.loader'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import type { NEventModule } from '@/stores/modules/nevent.module'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  module: NEventModule
}

export const NEventColumn = observer(function NEventColumn(props: Props) {
  const { module } = props

  useEffect(() => {
    neventLoader(module.options)
  }, [])

  const context = useContext(DeckContext)
  const note = useNoteStoreFromId(module.options.id)

  return (
    <>
      <DeckColumnHeader id={module.id}>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      <Stack horizontal={false} sx={styles.content}>
        <PostAwait rows={1} promise={context.delay}>
          {!note && <PostLoading rows={1} />}
          {note && <NostrEventRoot open event={note.event.event} />}
        </PostAwait>
      </Stack>
    </>
  )
})

const styles = css.create({
  content: {
    overflowY: 'auto',
  },
})
