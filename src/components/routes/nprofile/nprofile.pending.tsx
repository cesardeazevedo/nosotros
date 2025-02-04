import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { NProfileFeedTabs } from '@/components/modules/NProfile/NProfileFeedTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export const NProfilePending = function NProfilePending() {
  return (
    <CenteredContainer>
      <PaperContainer>
        <UserProfileHeader pubkey={'0'} />
        <Divider />
        <NProfileFeedTabs />
        <Divider />
        <PostLoading rows={5} />
      </PaperContainer>
    </CenteredContainer>
  )
}
