import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useUserRelays } from '@/hooks/query/useQueryUser'
import { READ, WRITE } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
}

export const UserRelays = memo(function UserRelays(props: Props) {
  const inboxQuery = useUserRelays(props.pubkey, READ)
  const outboxQuery = useUserRelays(props.pubkey, WRITE)
  const inboxRelays = inboxQuery.data?.map((x) => x.relay)
  const outboxRelays = outboxQuery.data?.map((x) => x.relay)
  return (
    <TooltipRich
      enterDelay={0}
      cursor='dot'
      floatingStrategy='fixed'
      placement='bottom-start'
      content={() => (
        <Paper elevation={4} surface='surfaceContainer' sx={styles.content}>
          <Stack horizontal gap={2} align='flex-start'>
            <html.div>
              <Text variant='label' size='lg'>
                Outbox Relays
              </Text>
              <Stack horizontal={false}>
                {outboxRelays?.map((relay) => (
                  <Text key={relay} size='sm'>
                    {relay.replace('wss://', '')}
                  </Text>
                ))}
              </Stack>
            </html.div>
            <html.div>
              <Text variant='label' size='lg'>
                Inbox Relays
              </Text>
              <Stack horizontal={false}>
                {inboxRelays?.map((relay) => (
                  <Text key={relay} size='sm'>
                    {relay.replace('wss://', '')}
                  </Text>
                ))}
              </Stack>
            </html.div>
          </Stack>
        </Paper>
      )}>
      <Stack gap={0.5}>
        {outboxQuery.isPending || inboxQuery.isPending ? (
          <Skeleton sx={styles.loading} />
        ) : (
          (inboxRelays?.length || 0) + (outboxRelays?.length || 0)
        )}
        <Text variant='label' size='lg' sx={styles.secondary}>
          Relays
        </Text>
      </Stack>
    </TooltipRich>
  )
})

const styles = css.create({
  root: {
    height: 40,
  },
  button: {
    fontFamily: 'monospace',
  },
  content: {
    width: 'auto',
    padding: spacing.padding2,
  },
  secondary: {
    color: palette.onSurfaceVariant,
  },
  loading: {
    width: 32,
    height: 20,
  },
})
