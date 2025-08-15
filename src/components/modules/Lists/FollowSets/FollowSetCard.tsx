import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { CardContent } from '@/components/ui/Card/CardContent'
import { CardTitle } from '@/components/ui/Card/CardTitle'
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

export const FollowSetCard = memo(function FollowSetCard(props: Props) {
  const { event } = props
  const isMobile = useSM()
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  const d = useEventTag(event, 'd')
  const pubkeys = useEventTags(event, 'p') || []
  return (
    <Stack key={event.id} sx={[styles.root, isMobile && styles.root$mobile]}>
      <FollowSetLink event={event}>
        <Stack horizontal={false}>
          <CardTitle
            headline={
              <Stack gap={1}>
                <UserHeader dense size='sm' pubkey={event.pubkey} />
                <PostHeaderDate date={event.created_at} dateStyle='long' />
              </Stack>
            }
          />
          <CardContent align='flex-start' sx={styles.content}>
            <CardTitle
              headline={title || <html.span style={styles.gray}>#{d?.slice(0, 20)}</html.span>}
              supportingText={description}
            />
            <Stack gap={3}>
              <UsersAvatars pubkeys={pubkeys} />
            </Stack>
          </CardContent>
        </Stack>
      </FollowSetLink>
    </Stack>
  )
})

const styles = css.create({
  root: {
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
})
