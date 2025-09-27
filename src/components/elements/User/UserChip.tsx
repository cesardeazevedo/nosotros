import { Chip } from '@/components/ui/Chip/Chip'
import { useUserState } from '@/hooks/state/useUser'
import { memo } from 'react'
import { UserAvatar } from './UserAvatar'

type Props = {
  pubkey: string
  selected?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export const UserChip = memo((props: Props) => {
  const { pubkey, selected, onClick, onDelete } = props
  const user = useUserState(pubkey)
  return (
    <Chip
      variant='input'
      selected={selected}
      icon={<UserAvatar size='xs' pubkey={pubkey} />}
      label={user?.displayName}
      onClick={onClick}
      onDelete={onDelete}
    />
  )
})
