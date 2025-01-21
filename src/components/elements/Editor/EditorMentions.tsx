import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { UserChip } from '../User/UserChip'

type Props = {
  store: EditorStore
}

export const EditorMentions = observer(function EditorMentions(props: Props) {
  const { store } = props
  return (
    <Stack horizontal={false} justify='flex-start' sx={styles.root}>
      <Stack horizontal sx={styles.header} justify='space-between'>
        <Stack horizontal={false}>
          <Text variant='title' size='md'>
            Mentions
          </Text>
          <Text variant='body' size='md' sx={styles.description}>
            You can remove some authors from being notified when mentioning or replying to them.
          </Text>
        </Stack>
        <Button variant='filledTonal' disabled={!store.broadcastDirt.value} onClick={() => store.resetBroadcaster()}>
          Reset
        </Button>
      </Stack>
      <Stack horizontal={false} sx={styles.content} gap={1}>
        {store.otherInboxRelays && store.otherInboxRelays.length > 0 && (
          <>
            <Stack align='flex-start' wrap={false} gap={1} horizontal={false}>
              <Stack wrap gap={0.5}>
                {store.mentions.map((pubkey) => (
                  <UserChip key={pubkey} pubkey={pubkey} onDelete={() => store.excludeMention(pubkey)} />
                ))}
              </Stack>
            </Stack>
          </>
        )}

        {store.otherInboxRelays && store.otherInboxRelays.length === 0 && (
          <Paper outlined shape='xl' surface='surfaceContainer' sx={styles.paper}>
            <Text size='md'>No one is being mentioned</Text>
          </Paper>
        )}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding2,
  },
  header: {
    paddingInline: spacing.padding2,
  },
  description: {
    maxWidth: '80%',
  },
  content: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  paper: {
    width: 'fit-content',
    padding: spacing.padding1,
    paddingInline: spacing.padding2,
  },
})
