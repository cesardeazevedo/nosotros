import { NostrEventQuote } from '@/components/elements/Event/NostrEventQuote'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEvent } from '@/hooks/query/useQueryBase'
import { useEventTag } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt } from '@tabler/icons-react'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { PostUserHeader } from '../Posts/PostUserHeader'

type Props = {
  event: NostrEventDB
}

const formatter = new Intl.NumberFormat()

export const ZapReceiptEvent = memo(function ZapReceiptEvent(props: Props) {
  const { event } = props
  const isMobile = useMobile()
  const eventId = useEventTag(event, 'e')
  const relatedEvent = useEvent(eventId || '').data
  const zapper = useEventTag(event, 'P')
  const amount = event.metadata?.bolt11?.amount?.value || 0
  const headerEvent = useMemo(() => {
    if (!zapper) {
      return event
    }
    return {
      ...event,
      pubkey: zapper,
    } as NostrEventDB
  }, [event, zapper])

  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      <Stack horizontal={!isMobile} justify='space-between' align='center' gap={isMobile ? 4 : 1}>
        {zapper ? (
          <PostUserHeader event={headerEvent} renderNIP05={false} />
        ) : (
          <Stack justify='flex-start' gap={2}>
            <Avatar>?</Avatar>
            <Text size='lg'>Anonymous</Text>
          </Stack>
        )}
        <Stack sx={styles.amount} gap={1} align='center' justify='center'>
          <IconBolt size={18} fill='currentColor' strokeOpacity='0' />
          <Text variant='label' size='lg'>
            {formatter.format(parseInt(amount || '0') / 1000)}
          </Text>
        </Stack>
      </Stack>
      {relatedEvent && <NostrEventQuote event={relatedEvent} />}
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
  amount: {
    padding: spacing.padding1,
    paddingInline: spacing.padding2,
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.full,
  },
})
