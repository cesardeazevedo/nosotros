import { NProfileFeedTabs } from '@/components/modules/NProfile/NProfileFeedTabs'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'
import { Outlet, useLoaderData } from '@tanstack/react-router'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { observer, Observer } from 'mobx-react-lite'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = {
  pubkey: string
  relays?: string[]
}

export const NProfileRoute = observer(function NProfileRoute(props: Props) {
  const { pubkey } = props
  const module = useLoaderData({ from: '/$nostr' }) as NProfileModule

  return (
    <NostrProvider nostrContext={() => module.context!} subFollows={false}>
      <CenteredContainer>
        <PaperContainer shape='none' elevation={2}>
          <Observer>{() => <UserProfileHeader pubkey={pubkey} />}</Observer>
          <Divider />
          <NProfileFeedTabs />
          <Divider />
          <Outlet />
        </PaperContainer>
      </CenteredContainer>
    </NostrProvider>
  )
})
