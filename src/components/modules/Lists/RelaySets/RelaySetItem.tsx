import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { RelaySetLink } from './RelaySetLink'

type Props = {
  event: NostrEventDB
  sx?: SxProps
}

export const RelaySetItem = memo(function RelaySetItem(props: Props) {
  const { event, sx } = props
  const isMobile = useSM()
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  const d = useEventTag(event, 'd')
  const relays = useEventTags(event, 'relay') || []
  return (
    <Stack key={event.id} sx={[styles.root, isMobile && styles.root$mobile, sx]}>
      <RelaySetLink event={event} sx={styles.link}>
        <Stack horizontal={false}>
          <Stack gap={1}>
            <UserHeader dense size='md' pubkey={event.pubkey} userAvatarProps={{ size: 'md' }} />
            <PostHeaderDate date={event.created_at} dateStyle='long' />
          </Stack>
          <Stack align='flex-start' sx={styles.content}>
            <Stack horizontal={false} grow>
              {title || <html.span style={styles.gray}>#{d?.slice(0, 20)}</html.span>}
              {description}
            </Stack>
            <Stack gap={2}>
              <Text variant='title' size='sm'>
                <Stack gap={1} justify='space-between'>
                  <IconServerBolt size={18} />
                  {relays?.length}
                </Stack>
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </RelaySetLink>
    </Stack>
  )
})

const styles = css.create({
  root: {
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
