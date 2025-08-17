import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { FollowSetLink } from './FollowSetLink'

type Props = {
  event: NostrEventDB
}

export const FollowSetItem = memo(function FollowSetItem(props: Props) {
  const { event } = props
  const isMobile = useSM()
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  const d = useEventTag(event, 'd')
  const pubkeys = useEventTags(event, 'p') || []
  return (
    <Stack sx={[styles.root, isMobile && styles.root$mobile]}>
      <FollowSetLink event={event} sx={styles.link}>
        <Stack horizontal={false} grow>
          <Stack gap={1}>
            <UserHeader dense size='md' pubkey={event.pubkey} userAvatarProps={{ size: 'md' }} />
            <PostHeaderDate date={event.created_at} dateStyle='long' />
          </Stack>
          <Stack align='flex-start' justify='space-between' sx={styles.content}>
            <Stack horizontal={false} grow>
              {title || <html.span style={styles.gray}>#{d?.slice(0, 20)}</html.span>}
              {description}
            </Stack>
            <Stack gap={3}>
              <UsersAvatars pubkeys={pubkeys} />
            </Stack>
          </Stack>
        </Stack>
      </FollowSetLink>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    cursor: 'pointer',
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
    borderLeft: '1px solid',
    borderBottom: '1px solid',
    borderLeftColor: palette.outlineVariant,
    borderBottomColor: palette.outlineVariant,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.08)',
    },
  },
  root$mobile: {
    width: '100%',
  },
  content: {
    paddingBlock: spacing.padding2,
  },
  gray: {
    color: palette.onSurfaceVariant,
  },
  link: {
    width: '100%',
  },
})
