import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import type { NProfileModule } from '@/stores/modules/nprofile.module'
import { observer } from 'mobx-react-lite'
import { Feed } from '../Feed/Feed'
import { FeedHeaderNprofile } from '../Feed/headers/FeedHeaderNprofile'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  module: NProfileModule
}

export const NProfileColumn = observer(function NProfileColumn(props: Props) {
  const { module } = props
  return (
    <>
      <FeedHeaderNprofile module={module} />
      <Divider />
      <Feed
        column
        header={
          <>
            <UserProfileHeader pubkey={module.pubkey} />
            <Divider />
            <NProfileFeedTabsState active={module.selected} onChange={(selected) => module.select(selected)} />
            <Divider />
          </>
        }
        feed={module.feed}
      />
    </>
  )
})
