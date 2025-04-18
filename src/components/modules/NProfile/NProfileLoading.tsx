import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { NProfileFeedTabs } from '@/components/modules/NProfile/NProfileFeedTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

type Props = {
  pubkey: string
}

export const NProfileLoading = function NProfileLoading(props: Props) {
  return (
    <CenteredContainer>
      <PaperContainer>
        <UserProfileHeader pubkey={props.pubkey} />
        <Divider />
        <NProfileFeedTabs />
        <Divider />
        <PostLoading rows={5} />
      </PaperContainer>
    </CenteredContainer>
  )
}
