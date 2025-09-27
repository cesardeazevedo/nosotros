import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import { Kind } from '@/constants/kinds'
import type { ProfileModule } from '@/hooks/modules/createProfileFeedModule'
import { createProfileModule } from '@/hooks/modules/createProfileFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo, useMemo, useState } from 'react'
import { Feed } from '../Feed/Feed'
import { FeedHeaderNprofile } from '../Feed/headers/FeedHeaderNprofile'
import type { NProfileTabs } from './NProfileFeedTabsState'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  module: ProfileModule
}

export const NProfileColumn = memo(function NProfileColumn(props: Props) {
  const { module } = props
  const { nip19 } = module
  const pubkey = module.filter.authors![0]
  const [selected, setSelected] = useState<NProfileTabs>('notes')

  const moduleSelected = useMemo(() => {
    switch (selected) {
      case 'notes': {
        return createProfileModule({ nip19, includeReplies: false })
      }
      case 'replies': {
        return createProfileModule({ nip19, includeReplies: true })
      }
      case 'media': {
        return createProfileModule({ nip19, filter: { kinds: [Kind.Media] } })
      }
      case 'articles': {
        return createProfileModule({ nip19, filter: { kinds: [Kind.Article] } })
      }
    }
  }, [selected, module])

  const feed = useFeedState(moduleSelected)

  return (
    <>
      <FeedHeaderNprofile pubkey={pubkey} />
      <Divider />
      <Feed
        key={selected}
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
