import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Divider } from '@/components/ui/Divider/Divider'
import type { NProfileFeeds, NProfileModule, NProfileModuleSnapshotOut } from '@/stores/nprofile/nprofile.module'
import { useRouter } from '@tanstack/react-router'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect } from 'react'
import { NProfileArticlesFeed } from './feeds/NProfileArticlesFeed'
import { NProfileNotesFeed } from './feeds/NProfileNotesFeed'
import { NProfileRepliesFeed } from './feeds/NProfileRepliesFeed'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

type Props = {
  module: NProfileModule
}

export const NProfileColumn = observer(function NProfileColumn(props: Props) {
  const { module } = props
  const { id } = module
  const router = useRouter()

  const selected = module.selected as keyof NProfileModuleSnapshotOut['feeds']
  useEffect(() => {
    const disposer = reaction(
      () => [module.selected],
      () => {
        router.invalidate()
      },
    )
    return () => disposer()
  }, [])

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
      <PaperContainer elevation={0} shape='none'>
        {selected === 'notes' && <NProfileNotesFeed header={header} module={module} />}
        {selected === 'replies' && <NProfileRepliesFeed header={header} module={module} />}
        {selected === 'articles' && <NProfileArticlesFeed header={header} module={module} />}
      </PaperContainer>
    </>
  )
})
