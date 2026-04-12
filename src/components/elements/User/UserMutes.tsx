import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  pubkey: string
}

export const UserMutes = (props: Props) => {
  const { pubkey } = props
  const user = useUserState(pubkey, { fullUserSync: true })
  const totalMuted = user.mutes?.data?.tags.filter((tag) => tag[0] === 'p').length || 0
  if (user.mutes?.isPending) {
    return <Skeleton sx={styles.loading} />
  }
  return (
    <LinkNEvent event={user.mutes?.data}>
      <Stack gap={0.5} sx={styles.underline}>
        <Text variant='label' size='lg'>
          {totalMuted}
        </Text>
        <Text variant='label' size='lg' sx={styles.secondary}>
          Muted
        </Text>
      </Stack>
    </LinkNEvent>
  )
}

const styles = css.create({
  underline: {
    cursor: 'pointer',
    textDecoration: {
      default: 'default',
      ':hover': 'underline',
    },
  },
  secondary: {
    color: palette.onSurfaceVariant,
  },
  loading: {
    width: 32,
    height: 20,
  },
})
