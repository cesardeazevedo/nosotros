import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { CardContent } from '@/components/ui/Card/CardContent'
import { CardTitle } from '@/components/ui/Card/CardTitle'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { RelaySetLink } from './RelaySetLink'

type Props = {
  event: NostrEventDB
}

export const RelaySetCard = memo(function RelaySetCard(props: Props) {
  const { event } = props
  const isMobile = useSM()
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  const d = useEventTag(event, 'd')
  const relays = useEventTag(event, 'relay') || []
  return (
    <Stack key={event.id} sx={[styles.root, isMobile && styles.root$mobile]}>
      <RelaySetLink event={event}>
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
            <Stack gap={2}>
              <Text variant='title' size='sm'>
                <Stack gap={1} justify='space-between'>
                  <IconServerBolt size={18} />
                  {relays?.length}
                </Stack>
              </Text>
            </Stack>
          </CardContent>
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
})
