import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { NavigationHeader } from '@/components/elements/Navigation/NavigationHeader'
import { NProfileFeedTabs } from '@/components/modules/NProfile/NProfileFeedTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { useResetScroll } from '@/hooks/useResetScroll'
import { Outlet } from '@tanstack/react-router'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { NProfileMutedContent } from './NProfileMutedContent'

export type Props = {
  pubkey: string
}

export const NProfileRoute = function NProfileRoute(props: Props) {
  useResetScroll()
  return (
    <RouteContainer header={<NavigationHeader />} margin={false}>
      <UserProfileHeader pubkey={props.pubkey} />
      <Divider />
      <NProfileFeedTabs />
      <Divider />
      <NProfileMutedContent pubkey={props.pubkey}>
        <Outlet />
      </NProfileMutedContent>
    </RouteContainer>
  )
}
