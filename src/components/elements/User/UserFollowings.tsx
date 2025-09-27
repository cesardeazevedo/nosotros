import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import { useNevent } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  pubkey: string
}

export const UserFollowings = (props: Props) => {
  const { pubkey } = props
  const user = useUserState(pubkey, { syncFollows: true })
  const nevent = useNevent(user.follows.data)
  return (
    <LinkNEvent nevent={nevent}>
      <Stack gap={0.5} sx={styles.underline}>
        <Text variant='label' size='lg'>
          {user.follows.isPending ? <Skeleton sx={styles.loading} /> : user.totalFollowing}
        </Text>
        <Text variant='label' size='lg' sx={styles.secondary}>
          Following
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
