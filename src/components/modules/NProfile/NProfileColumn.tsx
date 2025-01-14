import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import { useFeed } from '@/stores/feeds/hooks/useFeed'
import type { NProfileModule, NProfileModuleSnapshotOut } from '@/stores/nprofile/nprofile.module'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
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
  const { id, feeds } = module
  const selected = module.selected as keyof NProfileModuleSnapshotOut['feeds']

  useFeed(feeds[selected])

  const handleChange = useCallback((anchor: string | undefined) => {
    if (anchor) {
      module.select(anchor)
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
      <DeckColumnHeader id={id} name='Settings'>
        <UserHeader pubkey={module.options.pubkey} />
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        {selected === 'notes' && <NProfileNotesFeed header={header} module={module} />}
        {selected === 'replies' && <NProfileRepliesFeed header={header} module={module} />}
        {selected === 'media' && <NProfileMediaFeed header={header} module={module} />}
        {selected === 'articles' && <NProfileArticlesFeed header={header} module={module} />}
      </PaperContainer>
    </>
  )
})
