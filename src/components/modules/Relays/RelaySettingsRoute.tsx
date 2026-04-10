import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { RelayMailboxList } from '@/components/elements/Relays/RelayMailboxList'
import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { READ, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'

export const RelaySettingsRoute = () => {
  const pubkey = useCurrentPubkey()

  if (!pubkey) {
    return (
      <html.div style={styles.empty}>
        <Text variant='body' size='md'>
          Sign in to manage your relay settings.
        </Text>
      </html.div>
    )
  }

  return (
    <Stack horizontal={false} sx={styles.root}>
      <html.div style={styles.header}>
        <HeaderBase leading='Relay Settings' />
      </html.div>
      <Divider />
      <html.section role='region' style={styles.body}>
        <Stack horizontal={false} gap={2} sx={styles.section}>
          <Paper outlined surface='surfaceContainerLow' sx={styles.paper}>
            <RelayMailboxList pubkey={pubkey} permission={WRITE} />
          </Paper>
          <Paper outlined surface='surfaceContainerLow' sx={styles.paper}>
            <RelayMailboxList pubkey={pubkey} permission={READ} />
          </Paper>
        </Stack>
      </html.section>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  header: {
    width: '100%',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  section: {
    padding: spacing.padding2,
    alignItems: 'center',
  },
  paper: {
    width: '100%',
    maxWidth: 720,
  },
  empty: {
    width: '100%',
    height: '100%',
    padding: spacing.padding3,
  },
})
