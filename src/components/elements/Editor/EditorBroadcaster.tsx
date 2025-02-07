import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { RelayInputChip } from '../Relays/RelayInputChip'

type Props = {
  store: EditorStore
}

export const EditorBroadcaster = observer(function EditorBroadcaster(props: Props) {
  const { store } = props
  return (
    <Stack horizontal={false} justify='flex-start' sx={styles.root}>
      <Stack horizontal sx={styles.header} justify='space-between'>
        <Text variant='title' size='lg'>
          Broadcaster
        </Text>
        <Button variant='filledTonal' disabled={!store.broadcastDirt.value} onClick={() => store.resetBroadcaster()}>
          Reset
        </Button>
      </Stack>
      <Stack horizontal={false}>
        <Stack horizontal={false} sx={styles.panel} wrap={false} gap={1}>
          <Stack horizontal={false}>
            <Text variant='title' size='sm'>
              My Inbox relays
            </Text>
            <Text variant='body' size='md'>
              Those are relays where you write your notes
            </Text>
          </Stack>
          <Stack horizontal wrap gap={0.5}>
            {store.myOutboxRelays.map(({ relay }) => (
              <RelayInputChip renderConnectedIcon key={relay} url={relay} onDelete={() => store.excludeRelay(relay)} />
            ))}
            {/* <RelayChipAdd onSubmit={(relay) => store.includeRelay(relay)} /> */}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding1,
  },
  header: {
    paddingRight: spacing.padding1,
    paddingLeft: spacing.padding2,
  },
  panel: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
})
