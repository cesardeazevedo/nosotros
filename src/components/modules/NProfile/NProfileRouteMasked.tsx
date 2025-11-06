import { Divider } from '@/components/ui/Divider/Divider'
import { createProfileModule } from '@/hooks/modules/createProfileFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useNavigate } from '@tanstack/react-router'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { useMemo } from 'react'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { Feed } from '../Feed/Feed'
import { NProfileFeedTabsState } from './NProfileFeedTabsState'

export type Props = {
  pubkey: string
  nostr: string
}

export const NProfileRouteMasked = function NProfileRouteMasked(props: Props) {
  useResetScroll()
  const navigate = useNavigate()
  const { pubkey, nostr } = props
  const moduleSelected = useMemo(() => {
    return createProfileModule({ nip19: nostr, includeReplies: false })
  }, [nostr])

  const feed = useFeedState(moduleSelected)
  return (
    <CenteredContainer>
      <PaperContainer topRadius={false}>
        <UserProfileHeader pubkey={pubkey} />
        <Divider />
        <NProfileFeedTabsState
          active='notes'
          onChange={(selected) => {
            // we are killing the masked route when changing tabs
            navigate({ to: `/$nostr/${selected}`, params: { nostr } })
          }}
        />
        <Divider />
        <Feed feed={feed} />
        <Divider />
      </PaperContainer>
    </CenteredContainer>
  )
}
