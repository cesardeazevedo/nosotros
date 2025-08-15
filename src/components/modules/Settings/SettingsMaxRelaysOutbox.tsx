import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Slider } from '@/components/ui/Slider/Slider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsMaxRelaysOutbox = memo(function SettingsMaxRelaysOutbox() {
  const settings = useSettings()
  const set = useSetSettings()
  return (
    <MenuItem
      label={'Max relays per person when query'}
      supportingText={'The number of relays to query per person when outbox is enabled'}
      trailing={
        <Stack gap={2} sx={styles.wrapper} justify='flex-end'>
          <Slider
            value={settings.maxRelaysPerUser}
            onChange={(value) => set({ maxRelaysPerUser: value })}
            min={1}
            max={8}
          />
          <Text variant='title' size='md'>
            {settings.maxRelaysPerUser}
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
