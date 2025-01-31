import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NostrEventRepost } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowForward } from '@tabler/icons-react'
import { css, html } from 'react-strict-dom'
import { PostOptions } from '../Posts/PostOptions'
import { PostUserHeader } from '../Posts/PostUserHeader'
import { UserHeader } from '../User/UserHeader'
import { UserHeaderDate } from '../User/UserHeaderDate'

type Props = {
  event: NostrEventRepost
}

export const RepostHeader = (props: Props) => {
  const { event } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <Stack horizontal={false} sx={styles.content}>
        <UserHeader
          dense
          renderNIP05={false}
          pubkey={event.pubkey}
          gap={2}
          sx={styles.top}
          align='flex-start'
          size='sm'>
          <UserHeaderDate date={event.created_at} />
        </UserHeader>
        <PostUserHeader dense align='center' sx={styles.bottom} userAvatarProps={{ sx: styles.avatar }} />
        <Tooltip placement='bottom' text='Reposted'>
          <html.span style={styles.icon}>
            <IconArrowForward size={20} strokeWidth='1.8' />
          </html.span>
        </Tooltip>
      </Stack>
      <PostOptions />
    </Stack>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    padding: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  content: {
    position: 'relative',
    display: 'flex',
    width: 60,
    height: 60,
  },
  top: {
    position: 'absolute',
    color: palette.onSurfaceVariant,
    top: 0,
    left: 0,
  },
  bottom: {
    position: 'absolute',
    left: 16,
    bottom: 6,
  },
  avatar: {
    boxShadow: `0px 0px 0px 3px ${palette.surfaceContainerLowest}`,
  },
  icon: {
    position: 'absolute',
    left: -4,
    bottom: 14,
    color: palette.onSurface,
  },
})
