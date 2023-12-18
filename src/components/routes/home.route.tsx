import { Alert, Typography } from '@mui/material'
import { IconAlertCircle } from '@tabler/icons-react'
import DeckContainer from 'components/elements/Deck/DeckContainer'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import PaperContainer from 'components/elements/Layouts/PaperContainer'
import PostFab from 'components/elements/Posts/PostFab'
import SignInButtonFab from 'components/elements/SignIn/SignInButtonFab'
import FeedModule from 'components/modules/FeedModule'
import { entries } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useStore } from 'stores'
import { DeckStore } from 'stores/ui/deck.store'

const HomeRoute = observer(() => {
  const store = useStore()

  useEffect(() => {
    if (!store.deck.mainFeed) {
      store.initializeFeed()
    }
  }, [store])

  const mainFeed = store.deck.columns.get(DeckStore.MAIN_FEED)

  return (
    <>
      {!store.auth.currentUser ? <SignInButtonFab /> : <PostFab />}
      <CenteredContainer maxWidth='sm' sx={{ mt: 0, pt: 2, pb: 0, mb: 0 }}>
        <PaperContainer sx={{ mt: 0, mb: 0 }}>
          <Alert
            color='info'
            icon={<IconAlertCircle color='orange' />}
            sx={{ backgroundColor: 'transparent', color: 'inherit', alignItems: 'center' }}>
            <Typography variant='subtitle1'>
              <strong>nosotros.app</strong> still a <strong>read-only</strong> nostr client.
            </Typography>
          </Alert>
        </PaperContainer>
      </CenteredContainer>
      <DeckContainer>
        {!store.deck.enabled && mainFeed && <FeedModule feed={mainFeed} renderCreateForm />}
        {/* Untested */}
        {store.deck.enabled &&
          entries(store.deck.columns).map(([key, column], index) => (
            <FeedModule key={key} feed={column} renderCreateForm={index === 0} />
          ))}
      </DeckContainer>
    </>
  )
})

export default HomeRoute
