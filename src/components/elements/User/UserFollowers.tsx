// import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
// import { useUserState } from '@/hooks/state/useUser'
// import { useEventTag } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { css } from 'react-strict-dom'

// type Props = {
//   pubkey: string
// }

export const UserFollowers = () => {
  // const { pubkey } = props
  // const user = useUserState(pubkey, { fullUserSync: true })
  const followers = 0
  // const followers = useEventTag(user.trustedAssertionEvent, 'follower_cnt')
  // if (user.trustedAssertionQuery?.isPending) {
  //   return <Skeleton sx={styles.loading} />
  // }
  return (
    <>
      <Stack gap={0.5} sx={styles.underline}>
        <Text variant='label' size='lg'>
          {followers || '-'}
        </Text>
        <Text variant='label' size='lg' sx={styles.secondary}>
          Followers
        </Text>
      </Stack>
    </>
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
