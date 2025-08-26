import { Chip } from '@/components/ui/Chip/Chip'
import { useUserState } from '@/hooks/state/useUser'
import { memo } from 'react'
import { UserAvatar } from './UserAvatar'

type Props = {
  pubkey: string
  onDelete?: () => void
}

export const UserChip = memo((props: Props) => {
  const { pubkey, onDelete } = props
  const user = useUserState(pubkey)
  return (
    <Chip
      variant='input'
      icon={<UserAvatar size='xs' pubkey={pubkey} />}
      label={user?.displayName}
      onDelete={onDelete}
    />
  )
})
