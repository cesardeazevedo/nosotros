import UserProfileHeader from 'components/elements/User/UserProfileHeader'
import FeedModule from 'components/modules/FeedModule'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'

type Props = {
  pubkey: string
  relays?: string[]
}

const NProfileRoute = observer(function ProfileRoute(props: Props) {
  const { pubkey, relays } = props
  const store = useStore()

  const feed = useMemo(
    () => store.deck.columns.get(pubkey) || store.initializeProfileRoute(pubkey, relays),
    [store, pubkey, relays],
  )

  useEffect(() => {
    store.dialogs.closeReply()
  }, [store, pubkey])

  const user = store.users.getUserById(pubkey)

  return (
    <>
      <UserProfileHeader user={user} />
      {feed && <FeedModule feed={feed} renderCreateForm={false} />}
    </>
  )
})

export default NProfileRoute
