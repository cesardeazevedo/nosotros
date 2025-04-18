import { UserHeader } from '@/components/elements/User/UserHeader'
import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import type { NProfileModule } from '@/stores/modules/nprofile.module'
import { DeckColumnHeader } from '../Deck/DeckColumnHeader'
import { Feed } from '../Feed/Feed'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  module: NProfileModule
}

export const NProfileColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnHeader id={module.id} leading={<UserHeader pubkey={module.pubkey} />} />
      <Feed
        column
        header={
          <>
            <UserProfileHeader pubkey={module.pubkey} />
            <Divider />
            <NProfileFeedTabsState active={module.selected} onChange={() => {}} />
            <Divider />
          </>
        }
        feed={module.feed}
      />
    </>
  )
}
