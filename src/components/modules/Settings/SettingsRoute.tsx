import { SettingsTabs } from '@/components/modules/Settings/SettingsTabs'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { palette } from '@/themes/palette.stylex'
import { Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { css, html } from 'react-strict-dom'

const DEFAULT_WIDTH = 340
const MIN_WIDTH = 310
const MAX_WIDTH = 380

export const SettingsRoute = memo(() => {
  useResetScroll()
  const isMobile = useMobile()

  const content = (
    <html.div style={styles.main}>
      <Outlet />
    </html.div>
  )

  if (isMobile) {
    return (
      <html.div style={styles.mobile}>
        <SettingsTabs />
        {content}
      </html.div>
    )
  }

  return (
    <Group orientation='horizontal' resizeTargetMinimumSize={{ coarse: 24, fine: 12 }} style={panelStyles.columns}>
      <Panel
        defaultSize={DEFAULT_WIDTH}
        groupResizeBehavior='preserve-pixel-size'
        id='settings-list'
        maxSize={MAX_WIDTH}
        minSize={MIN_WIDTH}>
        <html.div style={styles.leftColumn}>
          <SettingsTabs />
        </html.div>
      </Panel>
      <Separator {...css.props(styles.resizeHandle)} />
      <Panel defaultSize='72%' id='settings-content' minSize='25%'>
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
