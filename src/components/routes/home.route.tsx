import { useMobile } from '@/hooks/useMobile'
import { authStore } from '@/stores/ui/auth.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { deckStore } from 'stores/ui/deck.store'
import { CenteredContainer } from '../elements/Layouts/CenteredContainer'
import PaperContainer from '../elements/Layouts/PaperContainer'
import PostFab from '../elements/Posts/PostFab'
import SignInButtonFab from '../elements/SignIn/SignInButtonFab'
import FeedMain from '../modules/Feed/FeedMain'

export function loadHome() {
  deckStore.home.feed.start()
}

const HomeRoute = observer(function HomeRoute() {
  const feed = deckStore.home
  const mobile = useMobile()
  return (
    <CenteredContainer sx={styles.root}>
      <PaperContainer elevation={1}>
        {!mobile && (!authStore.currentUser ? <SignInButtonFab /> : <PostFab />)}
        {feed && <FeedMain feed={feed.feed} renderCreatePost />}
      </PaperContainer>
    </CenteredContainer>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  root: {
    marginTop: {
      default: spacing.margin4,
      [MOBILE]: 0,
    },
  },
})

export default HomeRoute
