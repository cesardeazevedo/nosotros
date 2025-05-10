import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import type { NostrModule } from '@/stores/modules/nostr.module'
import { observer } from 'mobx-react-lite'
import { DeckScroll } from '../Deck/DeckScroll'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

export type Props = {
  module: NostrModule
}

export const NostrEventColumn = observer(function NostrEventColumn(props: Props) {
  const { module } = props
  const note = useNoteStoreFromId(module.eventId)
  const headerPubkey = note?.isRoot ? note.event.pubkey : note?.root?.pubkey
  return (
    <>
      <FeedHeaderBase leading={<UserHeader pubkey={headerPubkey || 'Post'} />} />
      <Divider />
      <DeckScroll>
        {!note && <PostLoading rows={1} />}
        {note && <NostrEventRoot open event={note.event.event} />}
        <Divider />
      </DeckScroll>
    </>
  )
})
