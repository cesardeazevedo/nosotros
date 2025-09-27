import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useActiveRelays, useConnectedRelays } from '@/hooks/useRelays'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { memo, useContext } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from './SidebarContext'

const iconProps = {
  size: 28,
  strokeWidth: '1.6',
}

export const SidebarMenuRelays = memo(function SidebarMenuRelays() {
  const context = useContext(SidebarContext)
  const activeRelays = useActiveRelays().length || ''
  const connected = useConnectedRelays().length || ''
  return (
    <Stack horizontal={false} gap={0.5} sx={styles.content}>
      <Link tabIndex={-1} to='/relays' activeOptions={{ exact: true }}>
        {({ isActive }) => (
          <MenuItem
            onClick={() => context.setPane(false)}
            selected={isActive}
            leadingIcon={<IconServerBolt {...iconProps} />}
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
        )}
      </Link>
    </Stack>
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
})
