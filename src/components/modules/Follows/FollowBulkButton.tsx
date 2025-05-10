import { Button } from '@/components/ui/Button/Button'
import { useCurrentAccount, useCurrentUser } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { useFollowSubmit } from './hooks/useFollowSubmit'

type Props = {
  pubkeys: string[]
}

export const FollowBulkButton = observer(function FollowBulkButton(props: Props) {
  const { pubkeys } = props
  const acc = useCurrentAccount()
  const user = useCurrentUser()
  const [pending, onSubmit] = useFollowSubmit(pubkeys)
  const isFollowingAll = pubkeys.every((x) => user?.followsPubkey(x) || x === user?.pubkey)
  return (
    <Button disabled={isFollowingAll || pending || !acc} variant='filled' onClick={() => acc && onSubmit(acc)}>
      Follow All ({pubkeys.length})
    </Button>
  )
})
