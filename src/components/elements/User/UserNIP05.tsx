import { Text } from '@/components/ui/Text/Text'
import { userStore } from '@/stores/users/users.store'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  pubkey?: string
}

export const UserNIP05 = observer(function UserNIP05(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  if (!user?.nip05) {
    return
  }
  return (
    <Text variant='label' size='sm' sx={styles.root}>
      {user.nip05}
    </Text>
  )
})

const styles = css.create({
  root: {
    opacity: 0.5,
    whiteSpace: 'nowrap',
    maxWidth: 250,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
})
