import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import type { ZapReceipt } from '@/stores/zaps/zap.receipt.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { UserHeader } from '../User/UserHeader'

type Props = {
  zap: ZapReceipt
}

const formatter = new Intl.NumberFormat()

export const ZapReceiptProfile = observer(function ZapReceiptProfile(props: Props) {
  const { zap } = props
  const { disableLink } = useNoteContext()
  const [shortDate, fullDate] = useRelativeDate(zap.event.created_at, 'long')
  return (
    <html.div style={styles.root}>
      <Stack justify='space-between' align='center' gap={1}>
        <UserHeader
          pubkey={zap.zapper!}
          disableLink={disableLink}
          footer={
            <Tooltip text={fullDate}>
              <Text variant='body' size='sm' sx={styles.date}>
                {shortDate}
              </Text>
            </Tooltip>
          }></UserHeader>
        <Stack horizontal={false} gap={0.5}>
          <Stack sx={styles.icon} gap={1} align='center' justify='center'>
            <IconBolt size={22} fill='currentColor' strokeOpacity='0' />
            <Text variant='label' size='lg'>
              {formatter.format(parseInt(zap.amount || '0') / 1000)}
            </Text>
          </Stack>
        </Stack>
        <UserHeader pubkey={zap.receiverProfile!} />
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
