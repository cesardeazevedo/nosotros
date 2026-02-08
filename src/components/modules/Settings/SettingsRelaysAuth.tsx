import { authRelaysAtom } from '@/atoms/relay.atoms'
import { authWhitelistAtom, toggleAuthRelayAtom } from '@/atoms/relayAuth.atoms'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { RelayFriendsList } from '@/components/elements/Relays/RelayFriendsList'
import { RelaySelectPopover } from '@/components/elements/Relays/RelaySelectPopover'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { dedupe } from '@/core/helpers/dedupe'
import { palette } from '@/themes/palette.stylex'
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
    <Stack horizontal={false} grow align='stretch' sx={styles.container}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          Relay Authentication
        </Text>
      </Stack>
      <Divider />
      <Stack grow horizontal={false} gap={2} align='flex-start' sx={styles.root}>
        <Stack sx={styles.description}>
          <Text variant='title' size='sm'>
            Relays asking for authentication when requesting notes, you can choose to automatically authenticate with
            them.
          </Text>
        </Stack>
        <table style={{ width: '100%' }} cellPadding={4}>
          <thead>
            <th align='left' {...css.props(styles.cell$first)}>
              Relay
            </th>
            <th align='right' {...css.props(styles.cell$last)}>
              Friends part of relay
            </th>
            <th align='right' {...css.props(styles.cell$last)}>
              Auto Authenticate
            </th>
          </thead>
          <tbody {...css.props(styles.tbody)}>
            {relays.map((url) => (
              <tr key={url} {...css.props(styles.row)}>
                <td {...css.props(styles.cell$first)}>
                  <RelayChip url={url} />
                </td>
                <td>
                  <RelayFriendsList url={url} />
                </td>
                <td align='right' {...css.props(styles.cell$last)}>
                  <Switch checked={authWhitelist.includes(url)} onChange={() => toggleAuthRelay(url)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Stack sx={styles.footer}>
          <RelaySelectPopover onSubmit={(url) => toggleAuthRelay(url)} />
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  container: {
    height: '100%',
  },
  root: {
    width: '100%',
    overflowY: 'auto',
    paddingBottom: spacing.padding3,
  },
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
  },
  description: {
    paddingTop: spacing.padding2,
    paddingInline: spacing.padding2,
    color: palette.onSurfaceVariant,
  },
  tbody: {
    paddingLeft: spacing.padding1,
  },
  row: {
    height: 50,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  cell$first: {
    paddingLeft: spacing.padding2,
  },
  cell$last: {
    paddingRight: spacing.padding2,
  },
  footer: {
    paddingInline: spacing.padding2,
  },
})
