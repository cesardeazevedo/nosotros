import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useActiveRelays, useConnectedRelays } from '@/hooks/useRelays'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt, IconWorldBolt } from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { memo, useContext } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from './SidebarContext'

type Props = {
  sx?: SxProps
}

const iconProps = {
  size: 28,
  strokeWidth: '1.6',
}

export const SidebarMenuRelays = memo(function SidebarMenuRelays(props: Props) {
  const pubkey = useCurrentPubkey()
  const match = useMatchRoute()
  const context = useContext(SidebarContext)
  const activeRelays = useActiveRelays().length || ''
  const connected = useConnectedRelays().length || ''
  const isRelayDiscovery = context.pane === '/explore/relays' || !!match({ to: '/explore/relays' })
  return (
    <>
      <Text size='md' sx={styles.label}>
        Relays
      </Text>
      <Stack horizontal={false} gap={0.5} sx={styles.content}>
        <Link tabIndex={-1} to='/relays/active'>
          {({ isActive }) => (
            <MenuItem
              onClick={() => context.setPane(false)}
              selected={isActive}
              leadingIcon={<IconServerBolt {...iconProps} />}
              label={
                <>
                  Active Relays{' '}
                  {connected ? (
                    <Text size='md' sx={styles.gray}>
                      ({connected} / {activeRelays})
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
    marginTop: spacing.margin1,
  },
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
  menuItem: {
    marginLeft: spacing.margin2,
  },
  label: {
    marginLeft: spacing.margin1,
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
})
