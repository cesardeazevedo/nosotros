import { setListFormDialogAtom } from '@/atoms/dialog.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { useEventAddress } from '@/hooks/query/useQueryBase'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RelayChip } from './RelayChip'

type Props = {
  relaySet: string
}

export const RelaySetsChip = memo(function RelaySetsChip(props: Props) {
  const { relaySet } = props
  const [pubkey, dTag] = relaySet.split(':')
  const setListFormDialog = useSetAtom(setListFormDialogAtom)
  const event = useEventAddress(Kind.RelaySets, pubkey, dTag)
  const label = useEventTag(event.data, 'title')
  const relays = useEventTags(event.data, 'relay')
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
                  return event.data && setListFormDialog(event.data)
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
