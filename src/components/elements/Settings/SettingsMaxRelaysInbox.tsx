import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Slider } from '@/components/ui/Slider/Slider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const SettingsMaxRelaysInbox = observer(function SettingsMaxRelaysOutbox() {
  const settings = useGlobalNostrSettings()
  return (
    <MenuItem
      label={
        <Text variant='body' size='lg' sx={styles.label}>
          Inbox max relays per person
        </Text>
      }
      supportingText={'The number of relays per person when publishing events to their inbox (replying, liking)'}
      trailing={
        <Stack gap={2} sx={styles.wrapper}>
          <Slider
            value={settings.maxRelaysPerUserInbox}
            onChange={(value) => settings.set('maxRelaysPerUserInbox', value)}
            min={1}
            max={10}
          />
          <Text variant='title' size='md'>
            {settings.maxRelaysPerUserInbox}
          </Text>
        </Stack>
      }
    />
  )
})

const styles = css.create({
  label: {
    maxWidth: 100,
  },
  wrapper: {
    minWidth: 110,
  },
})
