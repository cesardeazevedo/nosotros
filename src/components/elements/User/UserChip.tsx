import { Chip } from '@/components/ui/Chip/Chip'
import { userStore } from '@/stores/users/users.store'
import { observer } from 'mobx-react-lite'
import { UserAvatar } from './UserAvatar'

type Props = {
  pubkey: string
  onDelete: () => void
}

export const UserChip = observer((props: Props) => {
  const { pubkey, onDelete } = props
  const user = userStore.get(pubkey)
  return (
    <Chip
      variant='input'
      icon={<UserAvatar size='xs' pubkey={pubkey} />}
      label={user?.displayName}
      onDelete={onDelete}
    />
  )
})
