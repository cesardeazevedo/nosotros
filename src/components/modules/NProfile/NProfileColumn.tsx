import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo, useState } from 'react'
import { Feed } from '../Feed/Feed'
import { FeedHeaderNprofile } from '../Feed/headers/FeedHeaderNprofile'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  feedModule: FeedModule
}

export const NProfileColumn = memo(function NProfileColumn(props: Props) {
  const { feedModule } = props
  const pubkey = feedModule.filter.authors![0]
  const feed = useFeedState(feedModule)
  const [selected, setSelected] = useState('notes')
  return (
    <>
      <FeedHeaderNprofile pubkey={pubkey} />
      <Divider />
      <Feed
        column
        header={
          <>
            <UserProfileHeader pubkey={pubkey} />
            <Divider />
            <NProfileFeedTabsState active={selected} onChange={(selected) => setSelected(selected)} />
            <Divider />
          </>
        }
        feed={feed}
      />
    </>
  )
})
