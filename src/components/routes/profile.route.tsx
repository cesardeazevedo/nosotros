import UserProfileHeader from 'components/elements/User/UserProfileHeader'
import FeedModule from 'components/modules/feed'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from 'stores'

const ProfileRoute = observer(function ProfileRoute() {
  const { npub } = useParams()
  const store = useStore()

  const feed = useMemo(() => {
    const pubkey = store.auth.decode(npub)
    if (pubkey) {
      return store.deck.columns.get(pubkey) || store.initializeProfileRoute(pubkey)
    }
  }, [store, npub])

  useEffect(() => {
    store.dialogs.closeReply()
  }, [store, npub])

  const user = store.users.getUserById(feed?.authors[0])

  return (
    <>
      <UserProfileHeader user={user} />
      {feed && <FeedModule feed={feed} renderCreateForm={false} />}
    </>
  )
})

export default ProfileRoute
