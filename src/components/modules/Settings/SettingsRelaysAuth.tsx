import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { RelaySelectPopover } from '@/components/elements/Relays/RelaySelectPopover'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { dedupe } from '@/core/helpers/dedupe'
import { useRootStore } from '@/hooks/useRootStore'
import { relaysStore } from '@/stores/relays/relays.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const SettingsRelayAuth = observer(function SettingsRelayAuth() {
  const root = useRootStore()
  const relays = dedupe([...relaysStore.auths.keys(), ...root.globalContext.authWhitelist])
  return (
    <MenuItem
      sx={styles.root}
      label='Relays authentication'
      supportingText={'These relays are asking for authentication'}
      trailing={
        <Stack horizontal={false} gap={1} align='flex-start' sx={styles.content}>
          {relays.map((url) => (
            <Stack key={url} gap={1}>
              <RelayChip url={url} />
              <Switch
                checked={root.globalContext.authWhitelist.includes(url)}
                onChange={() => root.globalContext.toggleAuthRelay(url)}
              />
            </Stack>
          ))}
          <RelaySelectPopover onSubmit={(url) => root.globalContext.toggleAuthRelay(url)} />
        </Stack>
      }
    />
  )
})

const styles = css.create({
  root: {
    alignItems: 'flex-start',
  },
  content: {
    maxHeight: 400,
    overflowY: 'auto',
    padding: spacing.padding1,
    paddingLeft: 0,
  },
})
