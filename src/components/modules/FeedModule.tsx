import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import PostCreateForm from 'components/elements/Posts/PostCreate/PostCreateForm'
import PostVirtua from 'components/elements/Posts/PostList'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { FeedStore } from 'stores/modules/feed.store'

type Props = {
  renderCreateForm?: boolean
  feed: FeedStore
}

const FeedModule = observer(function FeedModule(props: Props) {
  const { feed, renderCreateForm = true } = props
  useEffect(() => {
    feed.subscribe()
  }, [feed])
  return (
    <CenteredContainer maxWidth='sm' sx={{ mb: 24 }}>
      {renderCreateForm && <PostCreateForm />}
      <PostVirtua feed={feed} />
    </CenteredContainer>
  )
})

export default FeedModule
