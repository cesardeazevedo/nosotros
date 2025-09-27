import { Button } from '@/components/ui/Button/Button'
import { useCurrentUser } from '@/hooks/useAuth'
import { memo } from 'react'
import { useFollowSubmit } from './hooks/useFollowSubmit'

type Props = {
  tag?: string
  values: string[]
}

export const FollowBulkButton = memo(function FollowBulkButton(props: Props) {
  const { tag = 'p', values } = props
  const user = useCurrentUser()
  const { isPending, mutate } = useFollowSubmit(tag, values)
  const isFollowingAll = values.every((x) => user?.followsTag(x) || x === user?.pubkey)
  return (
    <Button disabled={isFollowingAll || isPending} variant='filled' onClick={() => mutate()}>
      Follow All ({values.length})
    </Button>
  )
})
