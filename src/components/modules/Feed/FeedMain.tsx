import { Alert, Box, Typography } from '@mui/material'
import { IconAlertCircle } from '@tabler/icons-react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import PaperContainer from 'components/elements/Layouts/PaperContainer'
import Post from 'components/elements/Posts/Post'
import PostCreateForm from 'components/elements/Posts/PostCreate/PostCreateForm'
import PostLoading from 'components/elements/Posts/PostLoading'
import VirtualListWindow from 'components/elements/VirtualLists/VirtualListWindow'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import type { FeedModule } from 'stores/modules/feed.module'

type Props = {
  feed: FeedModule
  renderCreatePost?: boolean
}

const FeedMain = observer(function FeedModule(props: Props) {
  const { feed, renderCreatePost } = props

  useModuleSubscription(feed)

  return (
    <CenteredContainer maxWidth='sm' sx={{ mt: 0, pt: 2, pb: 0, mb: 24 }}>
      {renderCreatePost && (
        <PaperContainer sx={{ mt: 0, mb: 2 }}>
          <Alert
            color='info'
            icon={<IconAlertCircle color='orange' />}
            sx={{ backgroundColor: 'transparent', color: 'inherit', alignItems: 'center' }}>
            <Typography variant='subtitle1'>
              <strong>nosotros.app</strong> still a <strong>read-only</strong> nostr client.
            </Typography>
          </Alert>
        </PaperContainer>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', p: 0 }}>
        {renderCreatePost && <PostCreateForm />}
        <VirtualListWindow feed={feed} render={(id) => <Post key={id} id={id} />} />
        <PostLoading />
        <PostLoading />
      </Box>
    </CenteredContainer>
  )
})

export default FeedMain
