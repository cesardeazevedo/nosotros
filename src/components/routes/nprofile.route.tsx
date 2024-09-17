import { useLoaderData } from '@tanstack/react-router'
import UserProfileHeader from 'components/elements/User/UserProfileHeader'
import FeedMain from 'components/modules/Feed/FeedMain'
import { observer } from 'mobx-react-lite'
import { ProfileModule } from 'stores/modules/profile.module'
import { userStore } from 'stores/nostr/users.store'
import { deckStore } from 'stores/ui/deck.store'
import { CenteredContainer } from '../elements/Layouts/CenteredContainer'
import PaperContainer from '../elements/Layouts/PaperContainer'

type Props = {
  pubkey: string
  relays?: string[]
}

export function loadProfile(props: Props) {
  const { pubkey, relays } = props
  return deckStore.add(new ProfileModule({ pubkey, relays }))
}

const NProfileRoute = observer(function ProfileRoute(props: Props) {
  const { pubkey } = props
  const feed = useLoaderData({ from: '/$nostr' }) as ProfileModule

  const user = userStore.get(pubkey)

  return (
    <CenteredContainer>
      <PaperContainer shape='none' elevation={2}>
        <UserProfileHeader user={user} />
        {feed && <FeedMain feed={feed.feed} />}
      </PaperContainer>
    </CenteredContainer>
  )
})

export default NProfileRoute
