import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { RelayMonitorOverview } from '@/components/modules/RelayMonitor/RelayMonitorOverview'
import { RelayMonitorRoute } from '@/components/modules/RelayMonitor/RelayMonitorRoute'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { createRelayMonitorModule } from '@/hooks/modules/createRelayMonitorModule'
import { useActiveRelays, useConnectedRelays } from '@/hooks/useRelays'
import { useRelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { IconAdjustments, IconActivityHeartbeat, IconServerBolt } from '@tabler/icons-react'
import { Link, Outlet, useMatch } from '@tanstack/react-router'
import { atom, useAtom } from 'jotai'
import { memo, useMemo } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { css, html } from 'react-strict-dom'

const DEFAULT_WIDTH = 340
const MIN_WIDTH = 310
const MAX_WIDTH = 380

const iconProps = {
  size: 24,
  strokeWidth: '1.8',
}

const expandedRowsAtom = atom<Record<string, boolean>>({})

const RelaysMenu = (props: { monitorFeed?: ReturnType<typeof useRelayMonitorFeed> }) => {
  const { monitorFeed } = props
  const activeRelays = useActiveRelays().length || ''
  const connectedRelays = useConnectedRelays().length || ''
  const isMonitorRoute = !!useMatch({ from: '/relays/monitor', shouldThrow: false })
  const [expandedRows, setExpandedRows] = useAtom(expandedRowsAtom)

  return (
    <Stack horizontal={false}>
      <HeaderBase leading='Relays' />
      <Divider />
      <Stack horizontal={false} gap={0.5} sx={styles.menu}>
        <Link to='/relays' activeOptions={{ exact: true }}>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconAdjustments {...iconProps} />}
              label='Relay Settings'
            />
          )}
        </Link>
        <Link to='/relays/active'>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconServerBolt {...iconProps} />}
              label={
                <>
                  Active Relays{' '}
                  {connectedRelays ? (
                    <Text size='md' sx={styles.gray}>
                      ({connectedRelays} / {activeRelays})
                    </Text>
                  ) : (
                    ''
                  )}
                </>
              }
            />
          )}
        </Link>
        {isMonitorRoute && monitorFeed ? (
          <Expandable
            expanded={expandedRows.monitor ?? true}
            onChange={(expanded) => setExpandedRows((current) => ({ ...current, monitor: expanded }))}
            trigger={({ expanded, expand }) => (
              <html.div onClick={() => expand()}>
                <MenuItem
                  interactive
                  selected
                  leading={
                    <html.span style={styles.leading}>
                      {expanded ? (
                        <IconChevronDown size={18} strokeWidth='1.8' />
                      ) : (
                        <IconChevronRight size={18} strokeWidth='1.8' />
                      )}
                      <IconActivityHeartbeat {...iconProps} />
                    </html.span>
                  }
                  label='Relay Monitors (NIP-66)'
                />
              </html.div>
            )}>
            <html.div style={styles.overview}>
              <RelayMonitorOverview feed={monitorFeed} />
            </html.div>
          </Expandable>
        ) : (
          <Link to='/relays/monitor'>
            {({ isActive }) => (
              <MenuItem
                interactive
                selected={isActive}
                leadingIcon={<IconActivityHeartbeat {...iconProps} />}
                label='Relay Monitors (NIP-66)'
              />
            )}
          </Link>
        )}
      </Stack>
    </Stack>
  )
}

export const RelayRoute = memo(function RelayRoute() {
  useResetScroll()
  const isMobile = useMobile()
  const isMonitorRoute = !!useMatch({ from: '/relays/monitor', shouldThrow: false })
  const monitorModule = useMemo(() => createRelayMonitorModule(), [])
  const monitorFeed = useRelayMonitorFeed(monitorModule)

  const content = isMonitorRoute ? (
    <html.div style={styles.main}>
      <RelayMonitorRoute feed={monitorFeed} />
    </html.div>
  ) : (
    <html.div style={styles.main}>
      <Outlet />
    </html.div>
  )

  if (isMobile) {
    return (
      <html.div style={styles.mobile}>
        <RelaysMenu monitorFeed={isMonitorRoute ? monitorFeed : undefined} />
        {content}
      </html.div>
    )
  }

  return (
    <Group orientation='horizontal' resizeTargetMinimumSize={{ coarse: 24, fine: 12 }} style={panelStyles.columns}>
      <Panel
        defaultSize={DEFAULT_WIDTH}
        groupResizeBehavior='preserve-pixel-size'
        id='relays-menu'
        maxSize={MAX_WIDTH}
        minSize={MIN_WIDTH}>
        <html.div style={styles.leftColumn}>
          <RelaysMenu monitorFeed={isMonitorRoute ? monitorFeed : undefined} />
        </html.div>
      </Panel>
      <Separator {...css.props(styles.resizeHandle)} />
      <Panel defaultSize='72%' id='relays-content' minSize='25%'>
        {content}
      </Panel>
    </Group>
  )
})

const styles = css.create({
  mobile: {
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  leftColumn: {
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  menu: {
    width: '100%',
    padding: spacing.padding1,
  },
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
  leading: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing['padding0.5'],
  },
  overview: {
    paddingLeft: spacing.padding2,
  },
  main: {
    width: '100%',
    minWidth: 0,
    height: '100%',
    overflow: 'hidden',
  },
  resizeHandle: {
    height: '100%',
    cursor: 'col-resize',
    borderLeft: '1px solid',
    borderLeftColor: palette.outlineVariant,
    ':hover': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
    ':focus-visible': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
  },
})

const panelStyles = {
  columns: {
    width: '100%',
    height: '100%',
  } as const,
}
