import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { Link } from '../Links/Link'
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
          {state.protectedEvent ? (
            <Stack horizontal={false} sx={styles.protectedEvent}>
              <Text variant='title' size='md'>
                Protected Note{' '}
                <Link href='https://github.com/nostr-protocol/nips/blob/master/70.md'>
                  <html.span style={styles.link}>NIP-70</html.span>
                </Link>
              </Text>
              You are writing a protected note specific to {state.allRelays.join(',')}, other relays might still accept
              your note if they haven't implemented NIP-70, people being mentioned won't not be notified.
            </Stack>
          ) : (
            <>
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
            </>
          )}
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
              <RelayInputChip
                key={relay}
                url={relay}
                {...(state.protectedEvent ? {} : { onDelete: () => state.excludeRelay(relay) })}
              />
            ))}
            {!state.protectedEvent && (
              <RelaySelectPopover label='Add relay' onSubmit={(relay) => state.includeRelay(relay)} />
            )}
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
  protectedEvent: {
    border: '1px solid',
    borderColor: colors.orange6,
    borderRadius: shape.lg,
    padding: spacing.padding2,
  },
  link: {
    borderRadius: shape.sm,
    paddingInline: spacing.padding1,
    backgroundColor: palette.surfaceContainer,
    ':hover': {
      backgroundColor: palette.surfaceContainerHighest,
    },
  },
})
