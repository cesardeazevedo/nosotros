import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useActiveRelays, useConnectedRelays } from '@/hooks/useRelays'
import { useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  iconProps: {
    size?: number
    strokeWidth?: number | string
  }
}

export const SidebarMenuRelays = memo(function SidebarMenuRelays(props: Props) {
  const { sidebarCollapsed } = useSettings()
  const activeRelays = useActiveRelays().length || ''
  const connected = useConnectedRelays().length || ''
  return (
    <Stack horizontal={false} gap={0.5} sx={styles.content}>
      <Link tabIndex={-1} to='/relays' activeOptions={{ exact: true }}>
        {({ isActive }) => (
          <RelayTooltip collapsed={sidebarCollapsed}>
            <MenuItem
              interactive
              collapsed={sidebarCollapsed}
              selected={isActive}
              leadingIcon={<IconServerBolt {...props.iconProps} />}
              label={
                <>
                  Relays{' '}
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
          </RelayTooltip>
        )}
      </Link>
    </Stack>
  )
})

const RelayTooltip = (props: { collapsed: boolean; children: React.ReactNode }) => {
  const { collapsed, children } = props
  return (
    <Tooltip enterDelay={0} placement='right' text='Relays' opened={collapsed ? undefined : false}>
      {children}
    </Tooltip>
  )
}

const styles = css.create({
  content: {
    // marginTop: spacing.margin1,
  },
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
})
