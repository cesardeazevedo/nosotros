import { Text } from '@/components/ui/Text/Text'
import { userStore } from '@/stores/users/users.store'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  pubkey?: string
  hideForFollowing?: boolean
}

export const UserNIP05 = observer(function UserNIP05(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  if (!user || !user.meta.nip05) {
    return
  }
  // if (hideForFollowing && user?.following?.followsPubkey(pubkey)) {
  //   return
  // }
  return (
    <Text variant='label' size='sm' sx={styles.root}>
      {user.meta.nip05}
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
