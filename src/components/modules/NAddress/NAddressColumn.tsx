import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { naddressLoader } from '@/components/modules/NAddress/naddress.loader'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import { useNoteStoreFromAddress } from '@/hooks/useNoteStore'
import type { NAddressModule } from '@/stores/modules/naddress.module'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'

type Props = {
  module: NAddressModule
}

export const NAddressColumn = observer(function NAddressColumn(props: Props) {
  const { module } = props

  useEffect(() => {
    naddressLoader(module.options)
  }, [])

  const context = useContext(DeckContext)
  const note = useNoteStoreFromAddress(module.address)

  return (
    <>
      <DeckColumnHeader id={module.id}>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      <PostAwait rows={1} promise={context.delay}>
        {!note && <PostLoading rows={1} />}
        {note && <NostrEventRoot open event={note.event.event} />}
      </PostAwait>
      <Divider />
    </>
  )
})
