import type { UserRelayDB } from 'db/types'
import { observer } from 'mobx-react-lite'
import RelayUserChip from './RelayUserChip'

type Props = {
  relays: UserRelayDB[]
}

const RelayList = observer(function RelayList(props: Props) {
  return (
    <>
      {props.relays.map((userRelay) => (
        <RelayUserChip key={userRelay.relay} userRelay={userRelay} />
      ))}
    </>
  )
})

export default RelayList
