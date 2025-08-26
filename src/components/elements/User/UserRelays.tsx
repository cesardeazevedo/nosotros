import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useUserRelays } from '@/hooks/query/useQueryUser'
import { READ, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
}

export const UserRelays = memo(function UserRelays(props: Props) {
  const inboxRelays = useUserRelays(props.pubkey, READ).data?.map((x) => x.relay)
  const outboxRelays = useUserRelays(props.pubkey, WRITE).data?.map((x) => x.relay)
  return (
    <TooltipRich
      enterDelay={0}
      cursor='dot'
      floatingStrategy='fixed'
      placement='bottom-start'
      content={() => (
        <Paper elevation={4} surface='surfaceContainer' sx={styles.content}>
          <Stack horizontal gap={2} align='flex-start'>
            <html.div style={[]}>
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
      <Button sx={styles.button} variant='outlined'>
        <IconServerBolt size={20} strokeWidth='1.5' />
        {(inboxRelays?.length || 0) + (outboxRelays?.length || 0)}
      </Button>
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
})
