import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserName } from './UserName'
import { UserProfileBanner } from './UserProfileBanner'

type Props = {
  pubkey: string
}

export const UserRoot = memo(function UserRoot(props: Props) {
  const { pubkey } = props
  return (
    <>
      <UserProfileBanner dense pubkey={pubkey} />
      <Stack sx={styles.root} justify='space-between' gap={2}>
        <UserAvatar size='lg' sx={styles.avatar} pubkey={pubkey} />
        <Stack grow horizontal={false} sx={styles.name}>
          <UserName variant='title' size='lg' pubkey={pubkey} />
          <UserContentAbout pubkey={pubkey} />
        </Stack>
        <FollowButton value={pubkey} />
      </Stack>
    </>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    padding: spacing.padding2,
  },
  about: {
    marginLeft: spacing.margin7,
  },
  avatar: {
    position: 'absolute',
    top: -30,
    left: 30,
  },
  name: {
    marginTop: spacing.margin4,
  }
})
