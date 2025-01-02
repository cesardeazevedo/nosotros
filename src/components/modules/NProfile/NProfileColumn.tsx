import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import { useFeed } from '@/stores/feeds/hooks/useFeed'
import type { NProfileModule, NProfileModuleSnapshotOut } from '@/stores/nprofile/nprofile.module'
import { userStore } from '@/stores/users/users.store'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { NProfileArticlesFeed } from './feeds/NProfileArticlesFeed'
import { NProfileNotesFeed } from './feeds/NProfileNotesFeed'
import { NProfilePhotosFeed } from './feeds/NProfilePhotosFeed'
import { NProfileRepliesFeed } from './feeds/NProfileRepliesFeed'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  module: NProfileModule
}

export const NProfileColumn = observer(function FeedModule(props: Props) {
  const { module } = props
  const { id, feeds } = module
  const selected = module.selected as keyof NProfileModuleSnapshotOut['feeds']

  const user = userStore.get(module.options?.pubkey)

  useFeed(feeds[selected])

  const handleChange = useCallback((anchor: string | undefined) => {
    if (anchor) {
      module.select(anchor)
    }
  }, [])

  const header = (
    <>
      <UserProfileHeader user={user} />
      <Divider />
      <NProfileFeedTabsState active={selected} onChange={handleChange} />
      <Divider />
    </>
  )

  return (
    <>
      <DeckColumnHeader id={id} name='Settings'>
        <UserHeader pubkey={user?.pubkey} />
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        {selected === 'notes' && <NProfileNotesFeed header={header} module={module} />}
        {selected === 'replies' && <NProfileRepliesFeed header={header} module={module} />}
        {selected === 'photos' && <NProfilePhotosFeed header={header} module={module} />}
        {selected === 'articles' && <NProfileArticlesFeed header={header} module={module} />}
      </PaperContainer>
    </>
  )
})
