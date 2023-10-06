import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import PostCreateForm from 'components/elements/Posts/PostCreate/PostCreateForm'
import PostList from 'components/elements/Posts/PostList'
import { useSubscription } from 'hooks/useSubscription'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { FeedStore } from 'stores/modules/feed.store'

type Props = {
  renderCreateForm?: boolean
  feed: FeedStore
}

const FeedModule = observer(function FeedModule(props: Props) {
  const { feed, renderCreateForm = true } = props
  useSubscription(
    useCallback(() => {
      feed.subscribe()
    }, [feed]),
  )
  return (
    <CenteredContainer maxWidth='sm' sx={{ mb: 24 }}>
      {renderCreateForm && <PostCreateForm />}
      {/* <PostListVirtual feed={feed} /> */}
      <PostList feed={feed} />
    </CenteredContainer>
  )
})

export default FeedModule
