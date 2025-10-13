import { NProfileFeedTabs } from '@/components/modules/NProfile/NProfileFeedTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { useResetScroll } from '@/hooks/useResetScroll'
import { Outlet } from '@tanstack/react-router'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export type Props = {
  pubkey: string
}

export const NProfileRoute = function NProfileRoute(props: Props) {
  useResetScroll()
  return (
    <CenteredContainer>
      <PaperContainer topRadius={false}>
        <UserProfileHeader pubkey={props.pubkey} />
        <Divider />
        <NProfileFeedTabs />
        <Divider />
        <Outlet />
      </PaperContainer>
    </CenteredContainer>
  )
}
