import { Button } from '@/components/ui/Button/Button'
import { useCurrentUser } from '@/hooks/useAuth'
import { memo } from 'react'
import { useFollowSubmit } from './hooks/useFollowSubmit'

type Props = {
  pubkeys: string[]
}

export const FollowBulkButton = memo(function FollowBulkButton(props: Props) {
  const { pubkeys } = props
  const user = useCurrentUser()
  const { isPending, mutate } = useFollowSubmit(pubkeys)
  const isFollowingAll = pubkeys.every((x) => user?.followsPubkey(x) || x === user?.pubkey)
  return (
    <Button disabled={isFollowingAll || isPending} variant='filled' onClick={() => mutate()}>
      Follow All ({pubkeys.length})
    </Button>
  )
})
