import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import type { EventModule } from '@/hooks/modules/createEventModule'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
import { DeckScroll } from '../Deck/DeckScroll'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

export type Props = {
  module: EventModule
}

export const NostrEventColumn = memo(function NostrEventColumn(props: Props) {
  const { module } = props
  const note = useEventFromNIP19(module.nip19)
  const headerPubkey = note.data?.pubkey
  return (
    <>
      <FeedHeaderBase leading={headerPubkey ? <UserHeader pubkey={headerPubkey} /> : ''} />
      <Divider />
      <DeckScroll>
        {!note.data && <PostLoading rows={1} />}
        {note.data && <NostrEventRoot open event={note.data} />}
        <Divider />
      </DeckScroll>
    </>
  )
})
