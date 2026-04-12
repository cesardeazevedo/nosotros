import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRepostedEvent } from '@/hooks/query/useQueryBase'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowForward } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { PostHeaderDate } from '../Posts/PostHeaderDate'
import { PostOptions } from '../Posts/PostOptions'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'

type Props = {
  event: NostrEventDB
  children?: React.ReactNode
}

export const RepostHeader = memo(function RepostHeader(props: Props) {
  const { event, children } = props
  const { data } = useRepostedEvent(event)
  return (
    <Stack gap={2} horizontal align='flex-start' justify='space-between' sx={styles.root}>
      <Stack horizontal={false} sx={styles.avatars}>
        <UserAvatar sx={[styles.avatar, styles.avatarTop]} pubkey={event.pubkey} />
        {data && <UserAvatar sx={[styles.avatar, styles.avatarBorder, styles.bottom]} pubkey={data.pubkey} />}
        <html.span style={styles.icon}>
          <IconArrowForward size={20} strokeWidth='1.8' />
        </html.span>
      </Stack>
      <Stack horizontal={false} sx={styles.content}>
        <Stack sx={[styles.row, styles.top]} justify='space-between'>
          <UserName pubkey={event.pubkey} sx={styles.topText}>
            <PostHeaderDate date={event.created_at} />
          </UserName>
          <ContentProvider value={{ dense: false }}>
            <PostOptions event={event} />
          </ContentProvider>
        </Stack>
        {data && (
          <Stack sx={styles.row} justify='space-between'>
            <UserName pubkey={data.pubkey}>
              <PostHeaderDate date={event.created_at} />
            </UserName>
            <ContentProvider value={{ dense: false }}>
              <PostOptions event={data} />
            </ContentProvider>
          </Stack>
        )}
        {children}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    padding: spacing.padding2,
    paddingTop: spacing.padding3,
  },
  avatars: {
  },
  content: {
    position: 'relative',
    display: 'flex',
    marginTop: -10,
    width: '100%',
    minWidth: 0,
  },
  avatarTop: {
    position: 'relative',
    top: -8,
    left: -4,
  },
  top: {
    marginBottom: 4,
  },
  topText: {
    color: palette.onSurfaceVariant,
  },
  row: {
    height: 20,
  },
  bottom: {
    position: 'relative',
    justifySelf: 'flex-end',
    marginTop: -20,
    marginLeft: 8,
    left: 2,
    top: 2,
    display: 'flex',
  },
  avatar: {
    inlineSize: 28,
    blockSize: 28,
    maxBlockSize: 28,
    minBlockSize: 28,
    maxInlineSize: 28,
    minInlineSize: 28,
  },
  avatarBorder: {
    boxShadow: `0px 0px 0px 3px ${palette.surfaceContainerLowest}`,
  },
  icon: {
    position: 'absolute',
    left: 6,
    top: 40,
    color: palette.onSurface,
  },
})
