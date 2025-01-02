// import { Composer } from '@/components/elements/Compose/Composer'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Divider } from '@/components/ui/Divider/Divider'

export const HomePending = () => (
  <CenteredContainer margin>
    <PaperContainer elevation={1}>
      {/* <Composer compose={} /> */}
      <Divider />
      <PostLoading />
    </PaperContainer>
  </CenteredContainer>
)
