import PostFab from 'components/elements/Posts/PostFab'
import SignInButtonFab from 'components/elements/SignIn/SignInButtonFab'
import FeedMain from 'components/modules/Feed/FeedMain'
import { observer } from 'mobx-react-lite'
import { authStore } from 'stores/ui/auth.store'
import { deckStore } from 'stores/ui/deck.store'

export function loadHome() {
  deckStore.home.feed.start()
}

const HomeRoute = observer(function HomeRoute() {
  const feed = deckStore.home
  return (
    <>
      {!authStore.currentUser ? <SignInButtonFab /> : <PostFab />}
      {feed && <FeedMain feed={feed.feed} renderCreatePost />}
    </>
  )
})

export default HomeRoute
