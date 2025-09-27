import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRepostedEvent } from '@/hooks/query/useQueryBase'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowForward } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { PostHeaderDate } from '../Posts/PostHeaderDate'
import { PostOptions } from '../Posts/PostOptions'
import { PostUserHeader } from '../Posts/PostUserHeader'
import { UserHeader } from '../User/UserHeader'

type Props = {
  event: NostrEventDB
}

export const RepostHeader = memo(function RepostHeader(props: Props) {
  const { event } = props
  const { data } = useRepostedEvent(event)
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <Stack horizontal={false} justify='flex-start' sx={styles.content}>
        <UserHeader
          dense
          renderNIP05={false}
          pubkey={event.pubkey}
          gap={2}
          sx={styles.top}
          align='flex-start'
          size='sm'>
          <ContentProvider value={{ dense: true }}>
            <PostHeaderDate date={event.created_at} />
            <PostOptions event={event} />
          </ContentProvider>
        </UserHeader>
        {data && (
          <PostUserHeader
            dense
            event={data}
            align='center'
            sx={styles.bottom}
            userAvatarProps={{ sx: styles.avatar }}
          />
        )}
        <Tooltip placement='bottom' text='Reposted'>
          <html.span style={styles.icon}>
            <IconArrowForward size={20} strokeWidth='1.8' />
          </html.span>
        </Tooltip>
      </Stack>
      {data && <PostOptions event={data} />}
    </Stack>
  )
})

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
    top: -4,
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
