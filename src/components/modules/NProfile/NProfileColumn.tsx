import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import type { NProfileFeeds, NProfileModule, NProfileModuleSnapshotOut } from '@/stores/nprofile/nprofile.module'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { observer } from 'mobx-react-lite'
import { useCallback, useContext } from 'react'
import { NProfileArticlesFeed } from './feeds/NProfileArticlesFeed'
import { NProfileMediaFeed } from './feeds/NProfileMediaFeed'
import { NProfileNotesFeed } from './feeds/NProfileNotesFeed'
import { NProfileRepliesFeed } from './feeds/NProfileRepliesFeed'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  module: NProfileModule
}

export const NProfileColumn = observer(function NProfileColumn(props: Props) {
  const { module } = props
  const { id } = module
  const context = useContext(DeckContext)

  const selected = module.selected as keyof NProfileModuleSnapshotOut['feeds']

  useFeedSubscription(module.feed, module.contextWithFallback.client)

  const handleChange = useCallback((anchor: string | undefined) => {
    if (anchor) {
      module.select(anchor as keyof NProfileFeeds)
    }
  }, [])

  const header = (
    <>
      <UserProfileHeader pubkey={module.options.pubkey} />
      <Divider />
      <NProfileFeedTabsState active={selected} onChange={handleChange} />
      <Divider />
    </>
  )

  return (
    <>
      <DeckColumnHeader id={id}>
        <UserHeader pubkey={module.options.pubkey} />
      </DeckColumnHeader>
      {selected === 'notes' && <NProfileNotesFeed column delay={context.delay} header={header} module={module} />}
      {selected === 'replies' && <NProfileRepliesFeed column delay={context.delay} header={header} module={module} />}
      {selected === 'media' && <NProfileMediaFeed column delay={context.delay} header={header} module={module} />}
      {selected === 'articles' && <NProfileArticlesFeed column delay={context.delay} header={header} module={module} />}
    </>
  )
})
