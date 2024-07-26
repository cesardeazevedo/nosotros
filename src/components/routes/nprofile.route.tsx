import { useLoaderData } from '@tanstack/react-router'
import UserProfileHeader from 'components/elements/User/UserProfileHeader'
import FeedMain from 'components/modules/Feed/FeedMain'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { ProfileModule } from 'stores/modules/profile.module'
import { userStore } from 'stores/nostr/users.store'
import { deckStore } from 'stores/ui/deck.store'
import { dialogStore } from 'stores/ui/dialogs.store'

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

  useEffect(() => {
    dialogStore.closeReply()
  }, [pubkey])

  const user = userStore.get(pubkey)

  return (
    <>
      <UserProfileHeader user={user} />
      {feed && <FeedMain feed={feed.feed} />}
    </>
  )
})

export default NProfileRoute
