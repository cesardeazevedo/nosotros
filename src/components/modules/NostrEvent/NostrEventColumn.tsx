import { isDeletedEventAtomFamily } from '@/atoms/deletion.atoms'
import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostDeleted } from '@/components/elements/Posts/PostDeleted'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import type { EventModule } from '@/hooks/modules/createEventModule'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { nip19ToId } from '@/utils/nip19'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { DeckScroll } from '../Deck/DeckScroll'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

export type Props = {
  module: EventModule
}

export const NostrEventColumn = memo(function NostrEventColumn(props: Props) {
  const { module } = props
  const note = useEventFromNIP19(module.nip19, undefined, false)
  const id = nip19ToId(module.nip19)
  const deleted = useAtomValue(isDeletedEventAtomFamily(id))
  const headerPubkey = note.data?.pubkey
  return (
    <>
      <FeedHeaderBase leading={headerPubkey ? <UserHeader pubkey={headerPubkey} /> : ''} />
      <Divider />
      <DeckScroll>
        {deleted && <PostDeleted />}
        {!deleted && !note.data && <PostLoading rows={1} />}
        {!deleted && note.data && <NostrEventRoot open event={note.data} />}
        <Divider />
      </DeckScroll>
    </>
  )
})
