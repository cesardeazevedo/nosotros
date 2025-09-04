import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RelayInputChip } from '../Relays/RelayInputChip'
import { RelaySelectPopover } from '../Relays/RelaySelectPopover'
import { UserChip } from '../User/UserChip'
import { useEditorSelector } from './hooks/useEditor'

export const EditorBroadcaster = memo(function EditorBroadcaster() {
  const state = useEditorSelector((editor) => editor)
  return (
    <Stack horizontal={false} justify='flex-start' sx={styles.root}>
      <Stack horizontal sx={styles.header} justify='space-between'>
        <Text variant='title' size='lg'>
          Broadcaster
        </Text>
        <Button variant='filledTonal' disabled={!state.broadcastDirt} onClick={() => state.resetBroadcaster()}>
          Reset
        </Button>
      </Stack>
      <Stack horizontal={false}>
        <Stack horizontal={false} sx={styles.panel} wrap={false} gap={1}>
          <Stack horizontal={false}>
            <Text variant='title' size='md'>
              Mentions
            </Text>
            <Text variant='body' size='md' sx={styles.description}>
              You can remove some authors from being notified when mentioning them.
            </Text>
          </Stack>
          <Stack horizontal wrap gap={0.5}>
            <Stack align='flex-start' wrap={false} gap={1} horizontal={false}>
              <Stack wrap gap={0.5}>
                {state.mentions.map((pubkey) => (
                  <UserChip key={pubkey} pubkey={pubkey} onDelete={() => state.excludeMention(pubkey)} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Stack horizontal={false} sx={styles.panel} wrap={false} gap={1}>
          <Stack horizontal={false}>
            <Text variant='title' size='sm'>
              Relays
            </Text>
            <Text variant='body' size='md'>
              Those are relays the note will be published to, this includes the inbox relays from people being mentioned
              in the note
            </Text>
          </Stack>
          <Stack horizontal wrap gap={0.5}>
            {state.allRelays.map((relay) => (
              <RelayInputChip key={relay} url={relay} onDelete={() => state.excludeRelay(relay)} />
            ))}
            <RelaySelectPopover label='Add relay' onSubmit={(relay) => state.includeRelay(relay)} />
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
  description: {
    maxWidth: '70%',
  },
})
