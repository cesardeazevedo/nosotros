import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { userStore } from '@/stores/users/users.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
}

export const UserRelays = observer(function UserRelays(props: Props) {
  const user = userStore.get(props.pubkey)
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
                {user?.outboxRelays.map(({ relay }) => (
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
                {user?.inboxRelays.map(({ relay }) => (
                  <Text key={relay} size='sm'>
                    {relay.replace('wss://', '')}
                  </Text>
                ))}
              </Stack>
            </html.div>
          </Stack>
        </Paper>
      )}>
      <Button
        sx={styles.button}
        variant='outlined'
        icon={<IconServerBolt size={20} strokeWidth='1.5' />}
        onClick={() => open()}>
        {user?.relays.length || ''}
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
