import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { relaysStore } from '@/stores/relays/relays.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt, IconWorldBolt } from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from './SidebarContext'
import { SidebarSubheader } from './SidebarSubheader'

type Props = {
  sx?: SxProps
}

const iconProps = {
  size: 28,
  strokeWidth: '1.6',
}

export const SidebarMenuRelays = observer(function SidebarMenuRelays(props: Props) {
  const pubkey = useCurrentPubkey()
  const match = useMatchRoute()
  const context = useContext(SidebarContext)
  const activeRelays = relaysStore.connected.length
  const isRelayDiscovery = context.pane === '/explore/relays' || !!match({ to: '/explore/relays' })
  return (
    <>
      <SidebarSubheader label='Relays' />
      <Stack horizontal={false} gap={0.5}>
        <Link tabIndex={-1} to='/relays/active'>
          {({ isActive }) => (
            <MenuItem
              onClick={() => context.setPane(false)}
              selected={isActive}
              leadingIcon={<IconServerBolt {...iconProps} />}
              label={
                <>
                  Active Relays{' '}
                  {activeRelays ? (
                    <Text size='md' sx={styles.gray}>
                      ({activeRelays})
                    </Text>
                  ) : (
                    ''
                  )}
                </>
              }
            />
          )}
        </Link>
        <MenuItem
          selected={isRelayDiscovery}
          sx={props.sx}
          onClick={() => context.setPane('/explore/relays')}
          leadingIcon={<IconWorldBolt {...iconProps} />}
          label={'Discover Relays'}
        />
        {pubkey && (
          <Link tabIndex={-1} to='/relays' activeOptions={{ exact: true }}>
            {({ isActive }) => (
              <MenuItem
                selected={isActive}
                sx={props.sx}
                onClick={() => context.setPane(false)}
                leadingIcon={<IconServerBolt {...iconProps} />}
                label={'My Relays'}
              />
            )}
          </Link>
        )}
      </Stack>
    </>
  )
})

const styles = css.create({
  content: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  description: {
    paddingInline: spacing['padding0.5'],
    paddingRight: spacing.padding4,
    paddingBottom: spacing.padding1,
  },
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
  menuItem: {
    marginLeft: spacing.margin2,
  },
})
