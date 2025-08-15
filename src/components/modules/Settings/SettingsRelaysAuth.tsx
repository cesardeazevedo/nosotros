import { authRelaysAtom } from '@/atoms/relay.atoms'
import { authWhitelistAtom, toggleAuthRelayAtom } from '@/atoms/relayAuth.atoms'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { RelaySelectPopover } from '@/components/elements/Relays/RelaySelectPopover'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { dedupe } from '@/core/helpers/dedupe'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsRelayAuth = memo(function SettingsRelayAuth() {
  const authRelays = useAtomValue(authRelaysAtom)
  const toggleAuthRelay = useSetAtom(toggleAuthRelayAtom)
  const authWhitelist = useAtomValue(authWhitelistAtom)
  const relays = dedupe([...authRelays.map((x) => x[0]), ...authWhitelist])
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
              <Switch checked={authWhitelist.includes(url)} onChange={() => toggleAuthRelay(url)} />
            </Stack>
          ))}
          <RelaySelectPopover onSubmit={(url) => toggleAuthRelay(url)} />
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
