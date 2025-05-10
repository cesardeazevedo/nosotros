import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { Event } from '@/stores/events/event'
import { eventStore } from '@/stores/events/event.store'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { RelayChip } from './RelayChip'

type Props = {
  relaySet: string
}

export const RelaySetsChip = observer(function RelaySetsChip(props: Props) {
  const { relaySet } = props
  const [pubkey, dTag] = relaySet.split(':')
  const event = eventStore.getEventsByKindPubkeyTagValue(Kind.RelaySets, pubkey, 'd', dTag)?.[0] as Event | undefined
  const label = event?.getTag('title')
  const relays = event?.getTags('relay') || []
  const total = relays.length
  return (
    <Popover
      floatingStrategy='fixed'
      placement='bottom-start'
      contentRenderer={(props) => (
        <Paper outlined elevation={4} surface='surfaceContainerLow' sx={styles.popover}>
          <Stack sx={styles.header} justify='space-between'>
            <Text size='lg'>Relay Sets</Text>
            {event && (
              <Button
                variant='filled'
                onClick={() => {
                  props.close()
                  dialogStore.setListForm(event)
                }}>
                Edit
              </Button>
            )}
          </Stack>
          <Stack horizontal={false} align='flex-start' gap={0.5}>
            {relays.map((url) => (
              <RelayChip key={url} url={url} />
            ))}
          </Stack>
        </Paper>
      )}>
      {(props) => (
        <Chip
          {...props.getProps()}
          ref={props.setRef}
          icon={<IconServerBolt size={18} strokeWidth='1.8' />}
          label={`${label}`}
          onClick={props.open}
          trailingIcon={
            <Text variant='label' sx={styles.total}>
              {total}
            </Text>
          }
        />
      )}
    </Popover>
  )
})

const styles = css.create({
  total: {
    minWidth: 18,
    minHeight: 18,
    borderRadius: 12,
    backgroundColor: palette.surfaceContainerHigh,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  },
  popover: {
    width: 240,
    position: 'relative',
    right: spacing.margin1,
    padding: spacing.padding1,
  },
  header: {
    padding: spacing.padding1,
  },
})
