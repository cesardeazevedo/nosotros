import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { UserHeader } from '../User/UserHeader'

type Props = {
  event: NostrEventDB
}

const formatter = new Intl.NumberFormat()

export const ZapReceiptProfile = memo(function ZapReceiptProfile(props: Props) {
  const { event } = props
  const [shortDate, fullDate] = useRelativeDate(event.created_at, 'long')
  const zapper = useEventTag(event, 'P')
  const receiver = useEventTag(event, 'p')
  const amount = event.metadata?.bolt11?.amount?.value || 0
  return (
    <html.div style={styles.root}>
      <Stack justify='space-between' align='center' gap={1}>
        {zapper && (
          <UserHeader
            pubkey={zapper}
            footer={
              <Tooltip text={fullDate}>
                <Text variant='body' size='sm' sx={styles.date}>
                  {shortDate}
                </Text>
              </Tooltip>
            }
          />
        )}
        {!zapper && (
          <Stack justify='flex-start' gap={2}>
            <Avatar>?</Avatar>
            <Text size='lg'>Anonoymous</Text>
          </Stack>
        )}
        <Stack horizontal={false} gap={0.5}>
          <Stack sx={styles.icon} gap={1} align='center' justify='center'>
            <IconBolt size={22} fill='currentColor' strokeOpacity='0' />
            <Text variant='label' size='lg'>
              {formatter.format(parseInt(amount || '0') / 1000)}
            </Text>
          </Stack>
        </Stack>
        {receiver && <UserHeader pubkey={receiver} />}
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding2,
  },
  icon: {
    padding: spacing.padding1,
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.full,
  },
  date: {
    whiteSpace: 'nowrap',
  },
})
