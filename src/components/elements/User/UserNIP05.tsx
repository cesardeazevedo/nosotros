import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  pubkey: string
}

export const UserNIP05 = memo(function UserNIP05(props: Props) {
  const { pubkey } = props
  const user = useUserState(pubkey)
  if (!user.metadata?.nip05) {
    return
  }
  return (
    <Text variant='label' size='sm' sx={styles.root}>
      {user.metadata?.nip05}
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
